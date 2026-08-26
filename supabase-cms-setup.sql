create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  slug text unique, name text not null, place text, date_text text,
  toilets_fo text, toilets_en text,
  quiet boolean default false, own_food boolean default false, first_aid boolean default false,
  sort int default 0, is_active boolean default true, created_at timestamptz default now()
);
create table if not exists public.festival_toilets (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid references public.festivals(id) on delete cascade,
  name_fo text, name_en text, lat double precision, lng double precision,
  is_accessible boolean default false, sort int default 0
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique, type text,
  title_fo text, title_en text, place_fo text, place_en text, date_fo text, date_en text,
  time text, sort int default 0, is_active boolean default true, created_at timestamptz default now()
);

alter table public.festivals enable row level security;
alter table public.festival_toilets enable row level security;
alter table public.events enable row level security;

drop policy if exists festivals_anon_read on public.festivals;
create policy festivals_anon_read on public.festivals for select to anon using (true);
drop policy if exists festivals_auth_all on public.festivals;
create policy festivals_auth_all on public.festivals for all to authenticated using (true) with check (true);

drop policy if exists ftoilets_anon_read on public.festival_toilets;
create policy ftoilets_anon_read on public.festival_toilets for select to anon using (true);
drop policy if exists ftoilets_auth_all on public.festival_toilets;
create policy ftoilets_auth_all on public.festival_toilets for all to authenticated using (true) with check (true);

drop policy if exists events_anon_read on public.events;
create policy events_anon_read on public.events for select to anon using (true);
drop policy if exists events_auth_all on public.events;
create policy events_auth_all on public.events for all to authenticated using (true) with check (true);

do $$
begin
  if (select count(*) from public.festivals) = 0 then
    insert into public.festivals (slug, name, place, date_text, toilets_fo, toilets_en, quiet, own_food, first_aid, sort)
      values ('voxbotn', 'Voxbotn', 'Vágsbotnur, Tórshavn', '31. juli – 1. august 2026', 'Vesi á havnarøkinum', 'Toilets by the harbour area', true, true, true, 0);
    insert into public.festivals (slug, name, place, date_text, toilets_fo, toilets_en, quiet, own_food, first_aid, sort)
      values ('gfest', 'G! Festival', 'Syðrugøta', '16.–18. juli 2026', 'Nógv vesi á økinum', 'Plenty of toilets on site', true, true, true, 1);
    insert into public.festivals (slug, name, place, date_text, toilets_fo, toilets_en, quiet, own_food, first_aid, sort)
      values ('torsfest', 'Tórsfest', 'Miðborgin, Tórshavn', '12.–13. juni 2026', 'Vesi á tiltaksøkinum', 'Toilets at the event area', false, false, true, 2);
    insert into public.festivals (slug, name, place, date_text, toilets_fo, toilets_en, quiet, own_food, first_aid, sort)
      values ('olavsoka', 'Ólavsøka', 'Tórshavn', '28.–29. juli 2026', 'Almenn vesi í miðbýnum', 'Public toilets in the centre', false, true, true, 3);
    insert into public.festivals (slug, name, place, date_text, toilets_fo, toilets_en, quiet, own_food, first_aid, sort)
      values ('summar', 'Summarfestivalurin', 'Vágsbøður, Klaksvík', '6.–8. august 2026', 'Vesi við innganginum', 'Toilets at the entrance', true, false, true, 4);
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við høvuðssviðinum', 'Toilets by the main stage', 62.0076, -6.7686, false, 0 from public.festivals where slug = 'voxbotn';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Atkomuligt vesi', 'Accessible toilet', 62.0079, -6.7679, true, 1 from public.festivals where slug = 'voxbotn';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við matbásunum', 'Toilets by the food stalls', 62.0072, -6.7692, false, 2 from public.festivals where slug = 'voxbotn';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við inngongd', 'Toilets by the entrance', 62.0083, -6.7695, false, 3 from public.festivals where slug = 'voxbotn';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við høvuðssviðinum', 'Toilets by the main stage', 62.1962, -6.748, false, 0 from public.festivals where slug = 'gfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Atkomuligt vesi', 'Accessible toilet', 62.1968, -6.7472, true, 1 from public.festivals where slug = 'gfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi á tjaldingarplássinum', 'Toilets at the campsite', 62.1955, -6.7491, false, 2 from public.festivals where slug = 'gfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við strondini', 'Toilets by the beach', 62.1971, -6.7465, false, 3 from public.festivals where slug = 'gfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við inngongd', 'Toilets by the entrance', 62.2312, -6.5895, false, 0 from public.festivals where slug = 'summar';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Atkomuligt vesi', 'Accessible toilet', 62.2318, -6.5887, true, 1 from public.festivals where slug = 'summar';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við sviðinum', 'Toilets by the stage', 62.2306, -6.5901, false, 2 from public.festivals where slug = 'summar';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi á Vaglinum', 'Toilets at Vaglið', 62.0118, -6.7682, false, 0 from public.festivals where slug = 'torsfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Atkomuligt vesi', 'Accessible toilet', 62.0124, -6.7689, true, 1 from public.festivals where slug = 'torsfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við Tinganesi', 'Toilets by Tinganes', 62.0108, -6.7674, false, 2 from public.festivals where slug = 'torsfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi í SMS', 'Toilets in SMS', 62.0136, -6.7724, true, 3 from public.festivals where slug = 'torsfest';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi á Vaglinum', 'Toilets at Vaglið', 62.0116, -6.77, false, 0 from public.festivals where slug = 'olavsoka';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Atkomuligt vesi við Havnini', 'Accessible toilet by the harbour', 62.0073, -6.7686, true, 1 from public.festivals where slug = 'olavsoka';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við Roynd', 'Toilets by Roynd', 62.0101, -6.7712, false, 2 from public.festivals where slug = 'olavsoka';
    insert into public.festival_toilets (festival_id, name_fo, name_en, lat, lng, is_accessible, sort)
      select id, 'Vesi við Gundadali', 'Toilets by Gundadalur', 62.0155, -6.7779, false, 3 from public.festivals where slug = 'olavsoka';
  end if;
  if (select count(*) from public.events) = 0 then
    insert into public.events (slug, type, title_fo, title_en, place_fo, place_en, date_fo, date_en, time, sort)
      values ('e1', 'support', 'Stuðulsbólkur fyri IBD', 'IBD support group', 'Heilsuhúsið, Tórshavn', 'Heilsuhúsið, Tórshavn', 'tós. 25. juni', 'Thu 25 Jun', '19.30', 0);
    insert into public.events (slug, type, title_fo, title_en, place_fo, place_en, date_fo, date_en, time, sort)
      values ('e2', 'talk', 'Kostur og IBD', 'Diet and IBD', 'Á netinum (Teams)', 'Online (Teams)', 'mán. 1. juli', 'Mon 1 Jul', '20.00', 1);
    insert into public.events (slug, type, title_fo, title_en, place_fo, place_en, date_fo, date_en, time, sort)
      values ('e3', 'walk', 'Felagsganga í Havnardalinum', 'Group walk in Havnardalur', 'Møting við Svimjihøllina', 'Meet at the swimming hall', 'ley. 12. juli', 'Sat 12 Jul', '11.00', 2);
    insert into public.events (slug, type, title_fo, title_en, place_fo, place_en, date_fo, date_en, time, sort)
      values ('e4', 'meeting', 'Ársaðalfundur', 'Annual general meeting', 'Hotel Føroyar', 'Hotel Føroyar', 'mik. 27. august', 'Wed 27 Aug', '19.00', 3);
  end if;
end $$;
