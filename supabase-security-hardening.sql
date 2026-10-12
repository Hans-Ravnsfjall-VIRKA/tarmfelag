-- Tarmfelagið security hardening. Idempotent and guarded; safe to re-run.
-- Run once in the Supabase SQL editor.

-- Core content tables: enable RLS, public read, authenticated (admin) write.
do $$
declare t text;
begin
  foreach t in array array['toilets','toilet_hours','festivals','festival_toilets','events']
  loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "%s public read" on public.%I', t, t);
      execute format('create policy "%s public read" on public.%I for select to anon, authenticated using (true)', t, t);
      execute format('drop policy if exists "%s admin write" on public.%I', t, t);
      execute format('create policy "%s admin write" on public.%I for all to authenticated using (true) with check (true)', t, t);
    end if;
  end loop;
end $$;

-- Storage: only signed-in admins may upload. Remove any anonymous upload policy.
drop policy if exists "toilet photos anon upload" on storage.objects;
drop policy if exists "toilet photos auth upload" on storage.objects;
create policy "toilet photos auth upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'toilet-photos');
drop policy if exists "toilet photos public read" on storage.objects;
create policy "toilet photos public read" on storage.objects
  for select to public using (bucket_id = 'toilet-photos');

-- toilet_photos table: consumer upload was removed, so anon may read but not write.
do $$
begin
  if to_regclass('public.toilet_photos') is not null then
    execute 'alter table public.toilet_photos enable row level security';
    execute 'drop policy if exists "photos anon insert" on public.toilet_photos';
    execute 'drop policy if exists "photos anon read" on public.toilet_photos';
    execute 'create policy "photos anon read" on public.toilet_photos for select to anon using (true)';
    execute 'drop policy if exists "photos auth all" on public.toilet_photos';
    execute 'create policy "photos auth all" on public.toilet_photos for all to authenticated using (true) with check (true)';
  end if;
end $$;

-- PostGIS reference table flagged by the Supabase advisor: remove API access.
do $$
begin
  if to_regclass('public.spatial_ref_sys') is not null then
    begin
      execute 'revoke all on table public.spatial_ref_sys from anon, authenticated';
    exception when insufficient_privilege then null;
    end;
  end if;
end $$;
