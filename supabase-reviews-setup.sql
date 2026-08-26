create table if not exists public.toilet_reviews (
  id uuid primary key default gen_random_uuid(),
  toilet_key text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  author text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.toilet_reviews add column if not exists is_hidden boolean not null default false;
create index if not exists toilet_reviews_key_idx on public.toilet_reviews (toilet_key);
alter table public.toilet_reviews enable row level security;

drop policy if exists "reviews anon read" on public.toilet_reviews;
create policy "reviews anon read" on public.toilet_reviews
  for select to anon using (is_hidden = false);

drop policy if exists "reviews anon insert" on public.toilet_reviews;
create policy "reviews anon insert" on public.toilet_reviews
  for insert to anon with check (rating between 1 and 5 and is_hidden = false);

drop policy if exists "reviews auth all" on public.toilet_reviews;
create policy "reviews auth all" on public.toilet_reviews
  for all to authenticated using (true) with check (true);

create table if not exists public.toilet_photos (
  id uuid primary key default gen_random_uuid(),
  toilet_key text not null,
  url text not null,
  created_at timestamptz not null default now()
);
create index if not exists toilet_photos_key_idx on public.toilet_photos (toilet_key);
alter table public.toilet_photos enable row level security;

drop policy if exists "photos anon read" on public.toilet_photos;
create policy "photos anon read" on public.toilet_photos
  for select to anon using (true);

drop policy if exists "photos anon insert" on public.toilet_photos;
create policy "photos anon insert" on public.toilet_photos
  for insert to anon with check (true);

drop policy if exists "photos auth all" on public.toilet_photos;
create policy "photos auth all" on public.toilet_photos
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
  values ('toilet-photos', 'toilet-photos', true)
  on conflict (id) do nothing;

drop policy if exists "toilet photos anon upload" on storage.objects;
create policy "toilet photos anon upload" on storage.objects
  for insert to anon with check (bucket_id = 'toilet-photos');

drop policy if exists "toilet photos public read" on storage.objects;
create policy "toilet photos public read" on storage.objects
  for select to public using (bucket_id = 'toilet-photos');
