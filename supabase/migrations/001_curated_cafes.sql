-- Run this in your Supabase SQL editor to create the curated_cafes table

create table if not exists public.curated_cafes (
  id                 bigserial primary key,
  created_at         timestamptz default now(),
  curated_name       text not null,
  search_query       text not null,
  google_place_id    text,
  display_name       text,
  formatted_address  text,
  latitude           double precision,
  longitude          double precision,
  rating             double precision,
  user_rating_count  integer,
  price_level        integer,
  photo_names        text[],
  opening_hours      text[],
  google_maps_uri    text,
  website_uri        text,
  category_tags      text[] not null default '{}',
  specialty_tags     text[] not null default '{}',
  visited_by_me      boolean not null default false,
  matcha_available   boolean not null default false,
  coffee_available   boolean not null default true,
  notes              text,
  city_area          text,
  synced_at          timestamptz
);

-- Enable RLS
alter table public.curated_cafes enable row level security;

-- Allow public read
create policy "Public read" on public.curated_cafes
  for select using (true);

-- Allow service role full access (used by curated-sync API route)
create policy "Service role full access" on public.curated_cafes
  for all using (auth.role() = 'service_role');

-- Unique on curated_name to support upsert
create unique index if not exists curated_cafes_curated_name_idx on public.curated_cafes (curated_name);

-- Seed all 51 curated cafés (without Google data — run /api/places/curated-sync to enrich)
insert into public.curated_cafes (curated_name, search_query, city_area, category_tags, specialty_tags, visited_by_me, matcha_available, coffee_available) values
('Marcels Defence Colony',   'Marcels Defence Colony Delhi cafe',             'Defence Colony',     ARRAY['Date Spots','South Delhi Staples','Weekend Coffee Crawl','Visited By Me'], ARRAY['flat white','pastries','aesthetic','date spot'],          true,  false, true),
('Rush GK',                  'Rush cafe Greater Kailash Delhi matcha coffee', 'Greater Kailash',    ARRAY['Matcha Trail','South Delhi Staples','Visited By Me'],                      ARRAY['matcha','specialty coffee','aesthetic'],                  true,  true,  true),
('Hinoki',                   'Hinoki matcha cafe Delhi',                      'South Delhi',        ARRAY['Matcha Trail','New To Try'],                                               ARRAY['matcha','japanese','aesthetic'],                          false, true,  true),
('Espresso Anyday',          'Espresso Anyday Gurgaon cafe',                  'Gurgaon',            ARRAY['Gurgaon Coffee Map','Work Cafés','Visited By Me'],                         ARRAY['specialty coffee','work friendly','flat white'],          true,  false, true),
('1000 Coffee',              '1000 Coffee Galleria Gurgaon',                  'Gurgaon',            ARRAY['Gurgaon Coffee Map','Weekend Coffee Crawl','Visited By Me'],                ARRAY['specialty coffee','aesthetic','cozy'],                    true,  false, true),
('Nunkun',                   'Nunkun cafe Lodhi Colony Delhi',                'Lodhi Colony',       ARRAY['South Delhi Staples','Work Cafés','Hidden Gems','Visited By Me'],           ARRAY['specialty coffee','healthy bowls','work friendly'],       true,  false, true),
('Savorworks GK',            'Savorworks cafe Greater Kailash Delhi',         'Greater Kailash',    ARRAY['South Delhi Staples','Weekend Coffee Crawl','Visited By Me'],               ARRAY['tiramisu latte','specialty coffee','aesthetic'],          true,  false, true),
('Avaya',                    'Avaya cafe Green Park Delhi Vietnamese coffee',  'Green Park',         ARRAY['Vietnamese Coffee Trail','Hidden Gems','Visited By Me'],                   ARRAY['vietnamese coffee','burnt caramel','specialty coffee'],   true,  false, true),
('Brims',                    'Brims cafe Delhi specialty coffee',             'South Delhi',        ARRAY['South Delhi Staples','Work Cafés','Visited By Me'],                         ARRAY['specialty coffee','cozy','work friendly'],                true,  false, true),
('Enjis',                    'Enjis cafe Gurgaon Vietnamese coffee',          'Gurgaon',            ARRAY['Vietnamese Coffee Trail','Gurgaon Coffee Map','Visited By Me'],             ARRAY['vietnamese coffee','specialty coffee'],                   true,  false, true),
('Libertario Coffee',        'Libertario Coffee Delhi',                       'South Delhi',        ARRAY['South Delhi Staples','Work Cafés','Visited By Me'],                         ARRAY['specialty coffee','flat white','work friendly'],          true,  false, true),
('Roastery Coffee House',    'Roastery Coffee House Delhi',                   'South Delhi',        ARRAY['South Delhi Staples','Coffee Passport','New To Try'],                       ARRAY['specialty coffee','single origin','filter coffee'],       false, false, true),
('Paris Coffee House GK 2',  'Paris Coffee House Greater Kailash 2 Delhi',    'Greater Kailash 2',  ARRAY['Weekend Coffee Crawl','South Delhi Staples','New To Try'],                  ARRAY['pastries','cozy','aesthetic','french'],                   false, false, true),
('Ek Andaaz Coffee Window',  'Ek Andaaz coffee window South Delhi',           'South Delhi',        ARRAY['Hidden Gems','New To Try'],                                                ARRAY['grab and go','specialty coffee','lowkey'],                false, false, true),
('Cortasso Coffee',          'Cortasso Coffee Delhi Vietnamese brew',         'South Delhi',        ARRAY['Vietnamese Coffee Trail','Hidden Gems','Visited By Me'],                   ARRAY['vietnamese coffee','specialty coffee'],                   true,  false, true),
('Subko GK',                 'Subko cafe Greater Kailash Delhi specialty coffee','Greater Kailash', ARRAY['Work Cafés','South Delhi Staples','Coffee Passport','New To Try'],          ARRAY['specialty coffee','single origin','work friendly'],       false, false, true),
('Ikigai',                   'Ikigai cafe Defence Colony Delhi',              'Defence Colony',     ARRAY['Date Spots','South Delhi Staples','New To Try'],                            ARRAY['aesthetic','cozy','pastries','date spot'],                false, false, true),
('Daily Drama',              'Daily Drama cafe Defence Colony Delhi',         'Defence Colony',     ARRAY['Date Spots','Weekend Coffee Crawl','New To Try'],                           ARRAY['aesthetic','date spot','brunch'],                         false, false, true),
('Usco',                     'Usco coffee Shahpur Jat Delhi',                 'Shahpur Jat',        ARRAY['Hidden Gems','New To Try'],                                                ARRAY['specialty coffee','lowkey','aesthetic'],                  false, false, true),
('Akura Coffee',             'Akura Coffee Gurgaon',                         'Gurgaon',            ARRAY['Gurgaon Coffee Map','New To Try'],                                          ARRAY['specialty coffee','aesthetic'],                           false, false, true),
('Beanly',                   'Beanly cafe Panchsheel Park Delhi',             'Panchsheel Park',    ARRAY['Work Cafés','South Delhi Staples','Visited By Me'],                         ARRAY['specialty coffee','work friendly','cozy'],                true,  false, true),
('Common Time',              'Common Time cafe Lodhi Delhi',                  'Lodhi',              ARRAY['Hidden Gems','Date Spots','New To Try'],                                    ARRAY['aesthetic','cozy','specialty coffee'],                    false, false, true),
('The Suk',                  'The Suk cafe Delhi',                            'South Delhi',        ARRAY['Date Spots','New To Try'],                                                 ARRAY['aesthetic','date spot','cozy'],                           false, false, true),
('Monique',                  'Monique cafe New Friends Colony Delhi',         'New Friends Colony', ARRAY['Date Spots','South Delhi Staples','New To Try'],                            ARRAY['pastries','aesthetic','cozy','date spot'],                false, false, true),
('Rose Cafe',                'Rose Cafe Eldeco Delhi',                        'Eldeco',             ARRAY['Date Spots','Weekend Coffee Crawl','New To Try'],                           ARRAY['aesthetic','pastries','cozy','date spot'],                false, false, true),
('Good Hood Window',         'Good Hood coffee window Delhi',                 'South Delhi',        ARRAY['Hidden Gems','New To Try'],                                                ARRAY['grab and go','specialty coffee','lowkey'],                false, false, true),
('Caarabi Coffee Roasters',  'Caarabi Coffee Roasters Delhi',                 'Delhi',              ARRAY['Work Cafés','Coffee Passport','New To Try'],                                ARRAY['specialty coffee','single origin','filter coffee'],       false, false, true),
('Seven Seeds Coffee',       'Seven Seeds Coffee Delhi specialty',            'Delhi',              ARRAY['Work Cafés','Coffee Passport','New To Try'],                                ARRAY['specialty coffee','filter coffee','single origin','work friendly'], false, false, true),
('Firenze',                  'Firenze cafe Delhi Italian coffee',             'South Delhi',        ARRAY['Date Spots','Weekend Coffee Crawl','Visited By Me'],                        ARRAY['italian','pastries','aesthetic','date spot'],             true,  false, true),
('Kokoy',                    'Kokoy cafe Gurgaon',                            'Gurgaon',            ARRAY['Gurgaon Coffee Map','New To Try'],                                          ARRAY['specialty coffee','healthy bowls','aesthetic'],           false, false, true),
('Lofin',                    'Lofin cafe Lodhi Delhi',                        'Lodhi',              ARRAY['Hidden Gems','Date Spots','New To Try'],                                    ARRAY['aesthetic','cozy','date spot'],                           false, false, true),
('Pete''s Deli',             'Pete''s Deli Delhi cafe',                       'South Delhi',        ARRAY['Weekend Coffee Crawl','South Delhi Staples','Visited By Me'],               ARRAY['sandwiches','pastries','cozy'],                           true,  false, true),
('Byterra',                  'Byterra cafe Hauz Khas Delhi',                  'Hauz Khas',          ARRAY['Work Cafés','South Delhi Staples','New To Try'],                            ARRAY['work friendly','specialty coffee','cozy'],                false, false, true),
('Nubo',                     'Nubo cafe Hauz Khas Delhi rooftop',             'Hauz Khas',          ARRAY['Date Spots','Weekend Coffee Crawl','New To Try'],                           ARRAY['aesthetic','rooftop','date spot'],                        false, false, true),
('KKO',                      'KKO cafe Delhi specialty coffee',               'South Delhi',        ARRAY['Weekend Coffee Crawl','New To Try'],                                        ARRAY['specialty coffee','cozy','aesthetic'],                    false, false, true),
('La Tarte',                 'La Tarte cafe Greater Kailash 2 Delhi',         'Greater Kailash 2',  ARRAY['Date Spots','Weekend Coffee Crawl','New To Try'],                           ARRAY['pastries','aesthetic','french','date spot'],              false, false, true),
('Jay''s Coffee',            'Jay''s Coffee Delhi cafe specialty',            'South Delhi',        ARRAY['Weekend Coffee Crawl','South Delhi Staples','New To Try'],                  ARRAY['specialty coffee','flat white'],                          false, false, true),
('Pourover Coffee',          'Pourover coffee Santushti Delhi',               'Santushti',          ARRAY['Work Cafés','Coffee Passport','New To Try'],                                ARRAY['filter coffee','pour over','specialty coffee','work friendly'], false, false, true),
('Tan Coffee',               'Tan Coffee Delhi specialty',                    'South Delhi',        ARRAY['Work Cafés','Hidden Gems','New To Try'],                                    ARRAY['specialty coffee','lowkey','work friendly'],              false, false, true),
('Savage Sandwiches',        'Savage Sandwiches Hauz Khas Delhi cafe',        'Hauz Khas',          ARRAY['Weekend Coffee Crawl','South Delhi Staples','New To Try'],                  ARRAY['sandwiches','specialty coffee','cozy'],                   false, false, true),
('Tutto Gusto Coffee',       'Tutto Gusto Coffee South Delhi cafe',           'South Delhi',        ARRAY['South Delhi Staples','New To Try'],                                         ARRAY['italian','specialty coffee','aesthetic'],                 false, false, true),
('Doki Doki',                'Doki Doki cafe Saket Delhi matcha',             'Saket',              ARRAY['Matcha Trail','New To Try'],                                                ARRAY['matcha','japanese','aesthetic'],                          false, true,  true),
('ATE',                      'ATE cafe Safdarjung Delhi specialty coffee',    'Safdarjung',         ARRAY['Hidden Gems','New To Try'],                                                 ARRAY['specialty coffee','grab and go','lowkey'],                false, false, true),
('Shift Coffee Boulevard',   'Shift Coffee Boulevard Delhi',                  'Delhi',              ARRAY['Work Cafés','New To Try'],                                                  ARRAY['specialty coffee','work friendly','aesthetic'],           false, false, true),
('Cala',                     'Cala cafe Panchsheel Park Delhi',               'Panchsheel Park',    ARRAY['Weekend Coffee Crawl','Date Spots','New To Try'],                           ARRAY['aesthetic','cozy','pastries','date spot'],                false, false, true),
('Louve',                    'Louve cafe Delhi French',                       'South Delhi',        ARRAY['Date Spots','New To Try'],                                                  ARRAY['aesthetic','french','date spot','pastries'],              false, false, true),
('Chai and Co',              'Chai and Co Gurgaon matcha cafe',               'Gurgaon',            ARRAY['Matcha Trail','Gurgaon Coffee Map','New To Try'],                           ARRAY['matcha','specialty coffee'],                              false, true,  true),
('Vikoli',                   'Vikoli cafe Gurgaon specialty coffee',          'Gurgaon',            ARRAY['Gurgaon Coffee Map','New To Try'],                                          ARRAY['specialty coffee','aesthetic'],                           false, false, true),
('Savorworks Gurgaon',       'Savorworks cafe Gurgaon specialty coffee',      'Gurgaon',            ARRAY['Gurgaon Coffee Map','Work Cafés','Visited By Me'],                          ARRAY['tiramisu latte','specialty coffee','work friendly'],      true,  false, true),
('Gramstreet',               'Gramstreet cafe Gurgaon specialty coffee',      'Gurgaon',            ARRAY['Gurgaon Coffee Map','Weekend Coffee Crawl','Visited By Me'],                ARRAY['specialty coffee','aesthetic','work friendly'],           true,  false, true),
('Jay''s Coffee Chattarpur', 'Jay''s Coffee Chattarpur Delhi cafe',           'Chattarpur',         ARRAY['Weekend Coffee Crawl','New To Try'],                                        ARRAY['specialty coffee','cozy'],                                false, false, true)
on conflict (curated_name) do nothing;
