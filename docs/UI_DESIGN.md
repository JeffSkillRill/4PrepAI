# 4Prep UI design language

Last updated: 7 August 2026 (Asia/Tashkent)

## Design intent

4Prep uses a bright mint accent from the supplied brand mark, deep evergreen for trustworthy actions, and a nearly neutral canvas that keeps sourced information readable. The stronger contrast, compact rounded type, large labels, and crisp geometric progress marks feel current to a 17-year-old without borrowing the heavy gradients, glass effects, or oversized font payloads common in showcase designs. On a mid-range Android phone, the interface should feel immediate: the font stack adds no network request, content appears before motion, and decorative surfaces remain small and flat.

## Palette

All application colors are tokens in `app/src/index.css`. The supplied color logo is predominantly `#3CDBBF`; it is preserved as `brand`, but is not used for text on white because its contrast is only 1.74:1. Deep evergreen carries text, links, buttons, and meaningful chart marks. Color is always paired with an icon, label, position, pattern, or shape.

| Token / use | Foreground | Background | Contrast |
|---|---:|---:|---:|
| Body text on paper | `#102A2A` | `#FFFFFF` | 15.14:1 |
| Body text on canvas | `#102A2A` | `#F6F8F7` | 14.20:1 |
| Muted text on paper | `#52635F` | `#FFFFFF` | 6.35:1 |
| Muted text on canvas | `#52635F` | `#F6F8F7` | 5.95:1 |
| Primary button, default | `#FFFFFF` | `#075C4E` | 7.92:1 |
| Primary button, hover | `#FFFFFF` | `#06473D` | 10.63:1 |
| Primary button, pressed | `#FFFFFF` | `#04362F` | 13.34:1 |
| Disabled button | `#52635F` | `#D7DFDC` | 4.68:1 |
| Text link / secondary action | `#075C4E` | `#FFFFFF` | 7.92:1 |
| General-guidance label | `#075985` | `#F0F9FF` | 7.09:1 |
| Error label | `#991B1B` | `#FFF1F2` | 7.56:1 |
| Chart: complete / current | `#075C4E` | `#FFFFFF` | 7.92:1 |
| Chart: available / neutral | `#52635F` | `#FFFFFF` | 6.35:1 |
| Chart: awaiting feedback | `#835600` | `#FFFFFF` | 6.37:1 |
| Chart: feedback received | `#5A4393` | `#FFFFFF` | 7.90:1 |
| Chart: current on mint surface | `#06473D` | `#EAFBF7` | 9.94:1 |

The honest-gap surface stays neutral mint rather than amber and always says “Official data gap” with a file-search icon. A profile-dependent gap uses a blue surface, the label “Needs your answers,” and a clipboard icon. Neither treatment depends on color and neither resembles the rose error state.

## Type

The body family is the platform UI sans stack: `Inter`, `Noto Sans`, `Roboto`, `Helvetica Neue`, Arial, then the generic sans-serif. Display text uses the platform rounded stack: `ui-rounded`, `SF Pro Rounded`, followed by the body stack. This intentionally replaces the remote DM Sans and Manrope request; font payload is 0 bytes before and after the build, while the redesign removes the previous unbounded Google Fonts request entirely.

Weights are limited to 400, 600, 700, and 800. The scale is:

| Step | Size / line height | Use |
|---|---|---|
| XS | 12 / 16 px | Provenance and compact metadata |
| SM | 14 / 20 px | Secondary copy and controls |
| Base | 16 / 26 px | Body copy |
| LG | 18 / 28 px | Introductory copy |
| XL | 20 / 28 px | Card headings |
| 2XL | 24 / 32 px | Section headings |
| 3XL | `clamp(30px, 5vw, 48px)` / 1.08 | Page titles |
| Display | `clamp(40px, 8vw, 72px)` / 1.02 | Large hero only |

## Radius and elevation

Radii are 8 px (`sm`, chips), 12 px (`md`, controls), 16 px (`lg`, cards), 24 px (`xl`, feature panels), and full (`pill`, status labels). The smaller control radius keeps dense mobile screens crisp; the larger feature radius is reserved for page-level surfaces.

Elevation is deliberately sparse:

- `soft`: `0 8px 28px rgba(4, 54, 47, .08)` for ordinary cards.
- `card`: `0 18px 48px rgba(4, 54, 47, .12)` for a focused interactive card.
- `raised`: `0 24px 70px rgba(4, 54, 47, .16)` only for overlays or major floating surfaces.

Shadows never animate. Interactive feedback uses transform and opacity only.

## Brand assets

The repository supplied two 5,677 px transparent PNG icons: teal `4prep_logo_color.png` (333,674 bytes) and white `4prep_logo.png` (309,110 bytes). There is no supplied wordmark, vector, favicon, or social-preview composition. Production derivatives are resized from these originals: the teal icon is used on light navigation surfaces and the white icon on deep evergreen surfaces; accessible adjacent “4Prep” text supplies the wordmark. The bright brand teal is reconciled as an accent while accessibility-critical green stays deeper.
