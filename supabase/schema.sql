-- ============================================================
-- schema.sql
-- Run this in the Supabase SQL editor to create all tables.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS.
-- ============================================================

-- profiles: one row per auth user, created automatically on sign-up
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text,
  start_time    timestamptz NOT NULL,
  end_time      timestamptz,
  location_name text        NOT NULL,
  lat           double precision NOT NULL DEFAULT 0,
  lng           double precision NOT NULL DEFAULT 0,
  radius_km     double precision NOT NULL DEFAULT 10,
  source        text        DEFAULT 'user',
  external_id   text,
  dedupe_key    text        NOT NULL UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- event_saves  (user marks "interested")
CREATE TABLE IF NOT EXISTS public.event_saves (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id   uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_saves_pkey PRIMARY KEY (user_id, event_id)
);

-- event_joins  (user marks "going")
CREATE TABLE IF NOT EXISTS public.event_joins (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id   uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_joins_pkey PRIMARY KEY (user_id, event_id)
);

-- comments
CREATE TABLE IF NOT EXISTS public.comments (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);
