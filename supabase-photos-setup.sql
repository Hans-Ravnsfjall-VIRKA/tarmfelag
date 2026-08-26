alter table public.toilets add column if not exists photo_url text;

update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Tinganes_57.jpg?width=900'                                   where name = 'Almenn vesi á Vágsbryggju'        and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/H%C3%BAsav%C3%ADk,_Faroe_Islands.JPG?width=900'              where name = 'SMS handilsmiðstøð'               and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ei%C3%B0i,_Faroe_Islands.JPG?width=900'                      where name = 'Landssjúkrahúsið'                 and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gj%C3%B3gv,_Faroe_Islands_(winter).JPG?width=900'            where name = 'Klaksvíkar ferjuhavn'             and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bour,_Faroe_Islands_(5).JPG?width=900'                       where name = 'Vestmanna ferðavinnuhús'          and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gj%C3%B3gv,_Faroe_Islands.JPG?width=900'                     where name = 'Gjógv tjaldingarpláss'            and photo_url is null;
update public.toilets set photo_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bour,_Faroe_Islands_(3).JPG?width=900'                       where name = 'Kommunuskrivstovan í Sandavági'   and photo_url is null;
