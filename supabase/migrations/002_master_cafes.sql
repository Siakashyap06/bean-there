-- Master cafés table — single source of truth for every café in the app.
-- Run this after 001_curated_cafes.sql

create table if not exists public.cafes (
  id                bigserial primary key,
  google_place_id   text unique not null,
  display_name      text not null,
  address           text,
  latitude          double precision,
  longitude         double precision,
  rating            double precision,
  review_count      integer,
  photo_names       text[] default '{}',
  opening_hours     text[] default '{}',
  website           text,
  maps_url          text,
  categories        text[] default '{}',
  tags              text[] default '{}',
  source            text not null default 'google_places',  -- 'google_places' | 'curated_bean_there'
  featured          boolean default false,
  -- Curated overlay (populated by curated-sync when a curated café is matched)
  curated_name      text,
  city_area         text,
  category_tags     text[] default '{}',
  specialty_tags    text[] default '{}',
  visited_by_me     boolean default false,
  matcha_available  boolean default false,
  -- Timestamps
  last_synced       timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists cafes_location_idx on public.cafes (latitude, longitude);
create index if not exists cafes_featured_idx on public.cafes (featured) where featured = true;
create index if not exists cafes_source_idx on public.cafes (source);
create index if not exists cafes_tags_idx on public.cafes using gin (tags);
create index if not exists cafes_category_tags_idx on public.cafes using gin (category_tags);
create index if not exists cafes_specialty_tags_idx on public.cafes using gin (specialty_tags);
create index if not exists cafes_search_idx on public.cafes using gin (
  to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(address, '') || ' ' || coalesce(city_area, ''))
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger cafes_updated_at
  before update on public.cafes
  for each row execute function public.set_updated_at();

-- RLS
alter table public.cafes enable row level security;
create policy "Public read cafes" on public.cafes for select using (true);
create policy "Service role write cafes" on public.cafes for all using (auth.role() = 'service_role');
