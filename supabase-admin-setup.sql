insert into storage.buckets (id, name, public)
  values ('toilet-photos', 'toilet-photos', true)
  on conflict (id) do nothing;

drop policy if exists "toilet photos auth upload" on storage.objects;
create policy "toilet photos auth upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'toilet-photos');

drop policy if exists "toilet photos auth update" on storage.objects;
create policy "toilet photos auth update" on storage.objects
  for update to authenticated using (bucket_id = 'toilet-photos');

drop policy if exists "toilet photos public read" on storage.objects;
create policy "toilet photos public read" on storage.objects
  for select to public using (bucket_id = 'toilet-photos');
