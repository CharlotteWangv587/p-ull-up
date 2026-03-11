-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_joins (
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_joins_pkey PRIMARY KEY (user_id, event_id),
  CONSTRAINT event_joins_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_joins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.event_saves (
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  event_id uuid NOT NULL,
  CONSTRAINT event_saves_pkey PRIMARY KEY (user_id, event_id),
  CONSTRAINT event_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT event_saves_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  location_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_km double precision NOT NULL DEFAULT '10'::double precision,
  source text DEFAULT 'user'::text,
  external_id text,
  dedupe_key text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);