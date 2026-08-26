create table if not exists public.access_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'visit',
  client_id text,
  email text,
  ip text,
  country text,
  city text,
  lat double precision,
  lng double precision,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.access_log add column if not exists kind text not null default 'visit';
alter table public.access_log add column if not exists client_id text;
create index if not exists access_log_created_idx on public.access_log (created_at desc);
alter table public.access_log enable row level security;

drop policy if exists "access_log anon insert" on public.access_log;
create policy "access_log anon insert" on public.access_log
  for insert to anon with check (kind = 'visit');

drop policy if exists "access_log auth all" on public.access_log;
create policy "access_log auth all" on public.access_log
  for all to authenticated using (true) with check (true);
