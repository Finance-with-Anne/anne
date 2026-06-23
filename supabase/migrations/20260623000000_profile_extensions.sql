-- Extend profiles with bio, contact, social fields
alter table profiles
  add column if not exists bio       text,
  add column if not exists phone     text,
  add column if not exists location  text,
  add column if not exists website   text;

-- Avatar storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS policies
drop policy if exists "Public avatar access"         on storage.objects;
drop policy if exists "Users can upload own avatar"  on storage.objects;
drop policy if exists "Users can update own avatar"  on storage.objects;
drop policy if exists "Users can delete own avatar"  on storage.objects;

create policy "Public avatar access"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
