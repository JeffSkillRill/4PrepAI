-- Optional profile photos are public only by URL. Writes stay isolated to the
-- authenticated user's own top-level folder, and the modest limit keeps this
-- convenience feature from becoming a general file store.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/*']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars are publicly readable" on storage.objects;
drop policy if exists "avatar owner can insert" on storage.objects;
drop policy if exists "avatar owner can update" on storage.objects;
drop policy if exists "avatar owner can delete" on storage.objects;

create policy "avatars are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "avatar owner can insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "avatar owner can update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "avatar owner can delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
