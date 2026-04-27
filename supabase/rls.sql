-- ============================================================
-- rls.sql
-- Run this after schema.sql.
-- Enables Row Level Security and sets all access policies.
-- Safe to re-run: drops existing policies before recreating.
-- ============================================================

-- Enable RLS on every table
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_joins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────
-- Each user can only read and write their own profile row.

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ── events ──────────────────────────────────────────────────
-- Anyone can read events.
-- Only the creator can insert, update, or delete their event.

DROP POLICY IF EXISTS "events_select_public"       ON public.events;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_update_own"           ON public.events;
DROP POLICY IF EXISTS "events_delete_own"           ON public.events;

CREATE POLICY "events_select_public" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "events_insert_authenticated" ON public.events
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "events_delete_own" ON public.events
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ── event_saves ─────────────────────────────────────────────
-- Users can only see and manage their own saves.

DROP POLICY IF EXISTS "event_saves_select_own" ON public.event_saves;
DROP POLICY IF EXISTS "event_saves_insert_own" ON public.event_saves;
DROP POLICY IF EXISTS "event_saves_delete_own" ON public.event_saves;

CREATE POLICY "event_saves_select_own" ON public.event_saves
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "event_saves_insert_own" ON public.event_saves
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_saves_delete_own" ON public.event_saves
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── event_joins ─────────────────────────────────────────────
-- Users can only see and manage their own joins.

DROP POLICY IF EXISTS "event_joins_select_own" ON public.event_joins;
DROP POLICY IF EXISTS "event_joins_insert_own" ON public.event_joins;
DROP POLICY IF EXISTS "event_joins_delete_own" ON public.event_joins;

CREATE POLICY "event_joins_select_own" ON public.event_joins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "event_joins_insert_own" ON public.event_joins
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_joins_delete_own" ON public.event_joins
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── comments ────────────────────────────────────────────────
-- Anyone can read comments.
-- Only authenticated users can post.
-- Only the comment author can delete their own comment.
-- (Event creator / admin deletion is handled in the API route using the service role.)

DROP POLICY IF EXISTS "comments_select_public"      ON public.comments;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own"          ON public.comments;

CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());
