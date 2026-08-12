# Lesson Video Delivery and Admin Authoring

**Date:** 10 August 2026
**Status:** Plan for review. No code written.
**Decisions taken:** Cloudflare Stream with signed tokens; transcript and audio-only derived automatically from Stream; written plan before implementation.

---

## 1. Why Cloudflare Stream

### The constraint that decides it

`learning_lessons.media_url` is currently rendered as a plain progressive file:

```tsx
// app/src/screens/LearningScreens.tsx:504
<video className="aspect-video w-full" controls preload="metadata" src={lesson.mediaUrl}>
```

A single MP4 with no bitrate ladder is the wrong delivery mechanism for a student on a phone on a weak connection, which is a large share of the intended audience. Any option that keeps this shape is disqualified regardless of price.

### Option comparison

| | Cloudflare Stream | Supabase Storage | Mux | YouTube unlisted |
|---|---|---|---|---|
| Adaptive bitrate | Automatic HLS + DASH | None | Automatic | Automatic |
| Encoding cost | Free | N/A (no encoding) | Included | Free |
| Storage | $5 / 1,000 min / month | $0.021 / GB / month | ~$0.05 / min / month | Free |
| Delivery | $1 / 1,000 min | **$0.09 / GB egress** | ~$0.05 / 1,000 min + | Free |
| Access control | Signed JWT tokens, per-view TTL | Signed URLs | Signed tokens | None meaningful |
| Auto captions | Yes | No | Yes (paid add-on) | Yes |
| Upload path | Browser → Cloudflare direct | Through your stack | Browser → Mux direct | Manual |

### Where Supabase Storage fails

The existing `learning-submissions` bucket caps objects at 10 MiB and the MIME allow-list has no video types, so video would need a second bucket and new policies. That is the small problem. The real one is egress: a 500 MB lesson watched by 100 students is 50 GB, or **$4.50 of egress for one lesson**. The same 15-minute lesson on Stream costs $0.075/month to store and $1.50 to deliver to those 100 students — roughly a 20× difference, with adaptive bitrate included rather than absent.

### Where YouTube fails

The catalogue is the product. Unlisted URLs are guessable-adjacent, trivially reshared, carry Google branding and recommendation surfaces into a paid course, and give no per-student access signal. This conflicts with the counselor-honesty positioning.

### Cost at actual 4Prep scale

11 lessons × ~15 min ≈ 165 minutes of catalogue.

- Storage: 165 min ÷ 1,000 × $5 = **$0.83 / month**
- Delivery, 200 students completing everything: 200 × 165 = 33,000 min ÷ 1,000 × $1 = **$33 one-off**

Effectively free through soft launch, and the per-minute model means cost scales with watch time rather than with file size, so raising encode quality later costs nothing extra.

### The operational win: direct creator upload

Stream mints a one-time upload URL server-side. The browser then PUTs the file straight to Cloudflare. Nothing large crosses Supabase or Vercel, which sidesteps the Edge Function request body limit and the 10 MiB Storage cap entirely. This is the difference between an admin upload feature that works and one that fails on the first 800 MB screen recording.

---

## 2. Database migration

New migration: `app/supabase/migrations/202608100016_lesson_video_provider.sql`

```sql
alter table public.learning_lessons
  add column media_provider text not null default 'url'
    check (media_provider in ('url', 'cloudflare_stream')),
  add column media_duration_seconds integer
    check (media_duration_seconds is null or media_duration_seconds > 0),
  add column media_ready_at timestamptz;

comment on column public.learning_lessons.media_url is
  'When media_provider = ''url'', a directly playable URL. '
  'When media_provider = ''cloudflare_stream'', the Stream video UID.';
```

### What is deliberately not changed

The `published_learning_lesson_has_text_access` constraint stays exactly as written. It already requires non-empty `body`, `transcript`, `media_url`, and `audio_url` before a lesson can move to `published`. That constraint is the accessibility guarantee and the authoring flow is being designed to satisfy it, not to weaken it.

`media_url` remains a `text` column holding either a URL or a Stream UID, discriminated by `media_provider`. This avoids a data migration on the 11 existing rows, all of which are `draft` with `media_url is null`.

### Why a `media_ready_at` column

Stream encoding is asynchronous. A lesson can have a UID before the video is playable. `media_ready_at` lets the admin UI distinguish "uploaded, still encoding" from "ready to publish" without polling Cloudflare on every page load.

---

## 3. Secrets and Cloudflare configuration

Three new Edge Function secrets:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Stream API path segment |
| `CLOUDFLARE_STREAM_TOKEN` | API token scoped to **Stream: Edit** on that account only |
| `CLOUDFLARE_STREAM_KEY_ID` + `CLOUDFLARE_STREAM_KEY_PEM` | Signing key pair for playback tokens |

Cloudflare-side setup:

1. Create the Stream signing key once; store the PEM as a secret and never in the repository.
2. Set `requireSignedURLs: true` at upload time on every video, so a leaked UID alone cannot play.
3. Enable automatic captions (`/captions/en?generate=true`) after encoding completes.

The API token must be Stream-scoped. A global API key here would give the Edge Function authority over the whole Cloudflare account, which is a materially worse blast radius than the current service-role usage.

---

## 4. New `admin-api` actions

`admin-api` is currently read-only across all eight actions. These are its first content mutations, so each one writes an `admin_audit_log` row through the existing `auditAdminEvent` helper, with `resource_type: 'learning_lesson'` and `resource_id` set to the lesson ID.

| Action | Input | Effect |
|---|---|---|
| `lesson_list` | — | All modules with nested lessons: status, media state, whether each publish precondition is met |
| `lesson_upload_url` | `lessonId` | Calls Stream `direct_upload`, returns one-time upload URL + UID; writes UID to the lesson row, sets `media_provider='cloudflare_stream'` |
| `lesson_media_status` | `lessonId` | Polls Stream for encode state; on `ready`, stamps `media_ready_at`, `media_duration_seconds`, generates captions, populates `audio_url` |
| `lesson_save` | `lessonId`, `title?`, `body?`, `transcript?`, `durationMinutes?` | Field update, always leaves `status` untouched |
| `lesson_publish` | `lessonId`, `status: 'draft' \| 'published'` | Status transition; relies on the DB constraint as the final gate |

### Action-union additions

`AdminAction` in `app/supabase/functions/admin-api/index.ts:110` and the mirrored `AdminActionBody` in `admin/src/data/adminApi.ts:24` both grow these five variants, plus the matching branches in `parseAction` and the request dispatcher.

### Rate limit interaction — needs attention

`ADMIN_MINUTE_LIMIT = 30` in `_shared/adminAuth.ts`. A naive encode-status poll every 2 seconds burns the entire minute budget and locks the admin out of the console. Two mitigations, both required:

1. Poll `lesson_media_status` at a 10-second interval with exponential backoff to 60 seconds.
2. Show encoding progress from Cloudflare's own upload response where available, rather than polling for it.

If polling still proves too costly, the alternative is a Cloudflare webhook to a separate public Edge Function that verifies the Cloudflare signature — more moving parts, so only if the poll approach measurably fails.

### Failure semantics

If Stream returns an error on `lesson_upload_url`, no row is written and the audit entry records `outcome: 'failed'` with `reason_code: 'stream_upload_url_failed'`. A lesson never ends up with a UID that does not exist upstream.

---

## 5. Admin console UI

`admin/src/components/AdminConsole.tsx` is 704 lines and already carries cohort, student, and support views. The lesson editor goes in a new `admin/src/components/LessonEditor.tsx` rather than growing that file further.

Shape:

- **Module list** → lesson list per module, each row showing status and a four-part readiness indicator (body / transcript / video / audio).
- **Lesson detail** → title and duration fields, body textarea, transcript textarea (prefilled from Stream captions, editable), video drop zone.
- **Video drop zone** → requests `lesson_upload_url`, PUTs directly to Cloudflare with `XMLHttpRequest` for real byte progress. This mirrors the pattern already used for student submissions in `app/src/learning/`, so the progress and retry behaviour stays consistent across the codebase.
- **Publish control** → disabled with an explicit reason until all four preconditions are met. The button never fires a request it knows the database will reject.

The publish control mirroring the DB constraint client-side is duplication, and deliberately so: the constraint is the guarantee, the UI check is the explanation. An admin should learn *why* a lesson cannot publish without triggering a constraint violation.

---

## 6. Student-side player

`LessonMedia` in `app/src/screens/LearningScreens.tsx:499` changes from a bare `<video src>` to an HLS player.

### Playback token flow

Because `requireSignedURLs` is on, the app needs a short-lived token per view. `learning_lessons` is anonymous-readable today, but the *video* is not — the token endpoint requires an authenticated student. This is the intended asymmetry: lesson metadata stays crawlable and shareable, video bytes do not.

New app-side Edge Function `lesson-playback`:

1. Verify the caller's access token.
2. Load the lesson, confirm `status = 'published'` and `media_provider = 'cloudflare_stream'`.
3. Mint a Stream JWT with a short TTL (start at 2 hours — long enough to watch a lesson without re-issuing, short enough that a copied manifest URL dies quickly).
4. Return the signed manifest URL.

### Player choice: `hls.js`

- ~30 KB gzipped, loaded lazily only on lesson pages that have video.
- Safari plays HLS natively; `hls.js` covers Chrome, Firefox, and Edge.
- Keeps the existing Tailwind-styled `<video>` element and the current transcript/audio fallback markup untouched.

The alternative — Cloudflare's `<stream>` web component — is less code but pulls in a third-party iframe with its own styling and a separate consent surface. Given `hls.js` reuses the existing DOM and design system, it is the smaller change despite being more lines.

### Fallback chain preserved

Video fails → audio-only → transcript. All three already exist in the current markup. Nothing about this change should reduce that, and the publish constraint is what enforces it.

---

## 7. Files touched

| File | Change |
|---|---|
| `app/supabase/migrations/202608100016_lesson_video_provider.sql` | New |
| `app/supabase/functions/admin-api/index.ts` | Five action branches, Stream client calls |
| `app/supabase/functions/admin-api/contract.ts` | Validation helpers for lesson input |
| `app/supabase/functions/_shared/cloudflareStream.ts` | New: upload URL, status, captions, token signing |
| `app/supabase/functions/lesson-playback/index.ts` | New: student playback token |
| `admin/src/data/adminApi.ts` | Five methods |
| `admin/src/types.ts` | Lesson response types |
| `admin/src/components/LessonEditor.tsx` | New |
| `admin/src/components/AdminConsole.tsx` | Navigation entry only |
| `app/src/types/index.ts` | `mediaProvider`, `mediaReadyAt` on `LearningLesson` |
| `app/src/data/mappers.ts` | Map the new columns |
| `app/src/data/repository.ts` | Select the new columns; playback token call |
| `app/src/screens/LearningScreens.tsx` | `LessonMedia` → HLS |
| `app/package.json` | `hls.js` |

---

## 8. Sequencing

1. Cloudflare account, Stream signing key, scoped API token, Edge Function secrets in QA.
2. Migration applied to QA only.
3. `_shared/cloudflareStream.ts` with unit tests against recorded fixtures.
4. `admin-api` actions + `adminApi.ts` methods.
5. `LessonEditor.tsx`, proved by uploading one real video end to end in QA.
6. `lesson-playback` function + `hls.js` swap.
7. Verification gates below.
8. Production migration and secrets as a separately authorised step, consistent with how `010`–`013` were handled.

---

## 9. Verification gates

Matching the evidence standard used for the Storage isolation work in `docs/LEARNING_PORTAL.md`:

- [ ] Migration run inside a rollback-only transaction against QA before it is applied for real.
- [ ] Real video uploaded through the admin UI; encoding reaches `ready`; captions generate.
- [ ] Publish blocked with a stated reason while any of the four fields is empty; permitted once all four are filled; DB constraint confirmed as the backstop by attempting a direct SQL publish of an incomplete row.
- [ ] Unauthenticated `lesson-playback` call denied. Authenticated call for a `draft` lesson denied.
- [ ] Manifest URL copied out of a signed session fails to play after token expiry.
- [ ] A second, non-admin account cannot invoke any `lesson_*` action.
- [ ] `admin_audit_log` contains one row per mutation with correct `resource_id` and `outcome`.
- [ ] Playback verified on Safari (native HLS) and Chrome (`hls.js`), desktop and mobile viewport.
- [ ] Admin console remains usable during an upload — the rate limiter is not tripped by status polling.

---

## 10. Open questions

1. **Encoding presets.** Stream picks a ladder automatically. Worth checking whether the top rung should be capped at 1080p to hold delivery cost down, given lesson content is mostly slides and talking head.
2. **`audio_url` derivation.** Stream's MP4 download is video, not audio-only. Either accept a video-container file used as audio fallback, or add a small extraction step. The former is simpler and browsers handle it; the latter is honest to the field name. Recommend starting with the former and revisiting if bandwidth on the fallback path matters.
3. **Caption accuracy.** Auto-captions on accented English are imperfect. The plan assumes an admin edits the transcript before publishing; the UI should make that expectation explicit rather than implying the generated text is final.
