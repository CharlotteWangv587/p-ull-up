-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
--
-- ── Migration: run these in Supabase SQL editor to reach this state ───────────
--
--   -- 1. New columns on events
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_time_tbd      boolean   NOT NULL DEFAULT false;
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meetup_location_name text;
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meetup_lat        double precision;
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meetup_lng        double precision;
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS campus_affiliation text[]   NOT NULL DEFAULT '{}';
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS keywords          text[]   NOT NULL DEFAULT '{}';
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS spots             integer;
--   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_waitlist    boolean  NOT NULL DEFAULT false;
--
--   -- 2. Rename columns to match PDF spec
--   ALTER TABLE public.events RENAME COLUMN poster_url TO photo_url;
--   ALTER TABLE public.events RENAME COLUMN price      TO cost_text;
--
--   -- 3. start_time becomes nullable (TBD events have no time yet)
--   ALTER TABLE public.events ALTER COLUMN start_time DROP NOT NULL;
--
--   -- 4. Remove radius_km (replaced by per-event meetup coords)
--   ALTER TABLE public.events DROP COLUMN IF EXISTS radius_km;
--
--   -- 5. Fix created_by: NOT NULL + FK to profiles instead of auth.users
--   ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
--   ALTER TABLE public.events ALTER COLUMN created_by SET NOT NULL;
--   ALTER TABLE public.events ADD CONSTRAINT events_created_by_fkey
--     FOREIGN KEY (created_by) REFERENCES public.profiles(id);
--
--   -- 6. dedupe_key auto-generates for user events
--   ALTER TABLE public.events ALTER COLUMN dedupe_key SET DEFAULT gen_random_uuid()::text;
--
--   -- 7. Unique partial index on (source, external_id)
--   CREATE UNIQUE INDEX IF NOT EXISTS events_source_external_id_idx
--     ON public.events(source, external_id) WHERE external_id IS NOT NULL;
--
--   -- 8. Performance indexes
--   CREATE INDEX IF NOT EXISTS events_start_time_idx   ON public.events(start_time);
--   CREATE INDEX IF NOT EXISTS events_created_by_idx   ON public.events(created_by);
--   CREATE INDEX IF NOT EXISTS events_campus_affiliation_idx ON public.events USING GIN(campus_affiliation);
--   CREATE INDEX IF NOT EXISTS events_keywords_idx     ON public.events USING GIN(keywords);
--
--   -- 9. Fix event_saves FKs: user_id → profiles, event_id → ON DELETE CASCADE
--   ALTER TABLE public.event_saves DROP CONSTRAINT IF EXISTS event_saves_user_id_fkey;
--   ALTER TABLE public.event_saves DROP CONSTRAINT IF EXISTS event_saves_event_id_fkey;
--   ALTER TABLE public.event_saves ADD CONSTRAINT event_saves_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--   ALTER TABLE public.event_saves ADD CONSTRAINT event_saves_event_id_fkey
--     FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
--
--   -- 10. Fix event_joins FKs: same as event_saves
--   ALTER TABLE public.event_joins DROP CONSTRAINT IF EXISTS event_joins_user_id_fkey;
--   ALTER TABLE public.event_joins DROP CONSTRAINT IF EXISTS event_joins_event_id_fkey;
--   ALTER TABLE public.event_joins ADD CONSTRAINT event_joins_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--   ALTER TABLE public.event_joins ADD CONSTRAINT event_joins_event_id_fkey
--     FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
--
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.events (
  -- Identity
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Ownership / bookkeeping
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Core event identity
  title text NOT NULL,
  description text,

  -- Date / time  (start_time is null when is_time_tbd = true)
  start_time timestamp with time zone,
  end_time   timestamp with time zone,
  is_time_tbd boolean NOT NULL DEFAULT false,

  -- Event location
  location_name text NOT NULL,
  lat double precision,
  lng double precision,

  -- Meetup location (where attendees gather before going to the event)
  meetup_location_name text,
  meetup_lat double precision,
  meetup_lng double precision,

  -- Affiliation / categorisation  (array columns enable GIN-indexed search)
  campus_affiliation text[] NOT NULL DEFAULT '{}',
  keywords           text[] NOT NULL DEFAULT '{}',

  -- Media
  photo_url text,

  -- Cost / attendance logistics
  cost_text     text,
  spots         integer,
  allow_waitlist boolean NOT NULL DEFAULT false,

  -- Legacy / import support
  source      text NOT NULL DEFAULT 'user',
  external_id text,
  dedupe_key  text NOT NULL DEFAULT gen_random_uuid()::text,

  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT events_dedupe_key_key  UNIQUE (dedupe_key)
  -- Partial unique index on (source, external_id) is created separately:
  --   CREATE UNIQUE INDEX events_source_external_id_idx
  --     ON public.events(source, external_id) WHERE external_id IS NOT NULL;
);

-- Suggested indexes (create separately):
--   CREATE INDEX events_start_time_idx ON public.events(start_time);
--   CREATE INDEX events_created_by_idx ON public.events(created_by);
--   CREATE INDEX events_campus_affiliation_idx ON public.events USING GIN(campus_affiliation);
--   CREATE INDEX events_keywords_idx ON public.events USING GIN(keywords);

CREATE TABLE public.event_saves (
  user_id    uuid NOT NULL,
  event_id   uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_saves_pkey PRIMARY KEY (user_id, event_id),
  -- ON DELETE CASCADE: deleting a user or event cleans up saves automatically
  CONSTRAINT event_saves_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT event_saves_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)   ON DELETE CASCADE
);

CREATE TABLE public.event_joins (
  user_id    uuid NOT NULL,
  event_id   uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_joins_pkey PRIMARY KEY (user_id, event_id),
  CONSTRAINT event_joins_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT event_joins_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)   ON DELETE CASCADE
);

CREATE TABLE public.comments (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL,
  user_id    uuid NOT NULL,
  body       text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT comments_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES public.profiles(id)
);
