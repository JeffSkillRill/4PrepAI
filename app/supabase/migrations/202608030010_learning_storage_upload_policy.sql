begin;

-- Supabase Storage checks INSERT permission before streaming an upload. That
-- preflight metadata contains `contentLength`; the completed object metadata
-- contains `size`. Accept either representation without weakening the existing
-- owner, path, MIME, extension, or bucket checks from migration 009.
alter policy "learning submission object owner can insert allowed file"
on storage.objects
with check (
  bucket_id = 'learning-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and owner_id = (select auth.uid()::text)
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  )
  and case lower(coalesce(metadata->>'mimetype', ''))
    when 'application/pdf' then lower(storage.extension(name)) = 'pdf'
    when 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      then lower(storage.extension(name)) = 'docx'
    when 'text/csv' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.ms-excel' then lower(storage.extension(name)) = 'csv'
    when 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      then lower(storage.extension(name)) = 'xlsx'
    when 'image/jpeg' then lower(storage.extension(name)) in ('jpg', 'jpeg')
    when 'image/png' then lower(storage.extension(name)) = 'png'
    when 'image/webp' then lower(storage.extension(name)) = 'webp'
    when 'image/gif' then lower(storage.extension(name)) = 'gif'
    when 'image/heic' then lower(storage.extension(name)) = 'heic'
    when 'image/heif' then lower(storage.extension(name)) = 'heif'
    else false
  end
  and coalesce(
    nullif(metadata->>'contentLength', ''),
    nullif(metadata->>'size', '')
  )::bigint between 1 and 10485760
);

commit;
