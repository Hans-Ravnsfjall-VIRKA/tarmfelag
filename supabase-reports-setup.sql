create table if not exists public.toilet_reports (
  id uuid primary key default gen_random_uuid(),
  toilet_key text not null,
  kind text not null check (kind in ('closed', 'dirty', 'access', 'other')),
  comment text,
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);
create index if not exists toilet_reports_key_idx on public.toilet_reports (toilet_key);
create index if not exists toilet_reports_status_idx on public.toilet_reports (status);
alter table public.toilet_reports enable row level security;

drop policy if exists "reports anon insert" on public.toilet_reports;
create policy "reports anon insert" on public.toilet_reports
  for insert to anon with check (status = 'new' and kind in ('closed','dirty','access','other'));

drop policy if exists "reports auth all" on public.toilet_reports;
create policy "reports auth all" on public.toilet_reports
  for all to authenticated using (true) with check (true);
