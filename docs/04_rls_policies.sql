-- --------------------------------------------------
-- 04_rls_policies.sql
-- Enables Row Level Security and defines policies
-- for profiles, events, event_saves, event_joins, comments
-- --------------------------------------------------

-- -----------------------------
-- Enable RLS
-- -----------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_saves enable row level security;
alter table public.event_joins enable row level security;
alter table public.comments enable row level security;

-- -----------------------------
-- Drop existing policies
-- -----------------------------

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

-- events
drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_insert_authenticated" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

-- event_saves
drop policy if exists "event_saves_select_own" on public.event_saves;
drop policy if exists "event_saves_insert_own" on public.event_saves;
drop policy if exists "event_saves_delete_own" on public.event_saves;

-- event_joins
drop policy if exists "event_joins_select_own" on public.event_joins;
drop policy if exists "event_joins_insert_own" on public.event_joins;
drop policy if exists "event_joins_delete_own" on public.event_joins;

-- comments
drop policy if exists "comments_select_public" on public.comments;
drop policy if exists "comments_insert_authenticated" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;

-- -----------------------------
-- profiles
-- owner only read/update
-- -----------------------------

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- -----------------------------
-- events
-- public read
-- creator controls updates/deletes
-- -----------------------------

create policy "events_select_public"
on public.events
for select
to anon, authenticated
using (true);

create policy "events_insert_authenticated"
on public.events
for insert
to authenticated
with check (created_by = auth.uid());

create policy "events_update_own"
on public.events
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "events_delete_own"
on public.events
for delete
to authenticated
using (created_by = auth.uid());

-- -----------------------------
-- event_saves
-- owner only
-- -----------------------------

create policy "event_saves_select_own"
on public.event_saves
for select
to authenticated
using (user_id = auth.uid());

create policy "event_saves_insert_own"
on public.event_saves
for insert
to authenticated
with check (user_id = auth.uid());

create policy "event_saves_delete_own"
on public.event_saves
for delete
to authenticated
using (user_id = auth.uid());

-- -----------------------------
-- event_joins
-- owner only
-- -----------------------------

create policy "event_joins_select_own"
on public.event_joins
for select
to authenticated
using (user_id = auth.uid());

create policy "event_joins_insert_own"
on public.event_joins
for insert
to authenticated
with check (user_id = auth.uid());

create policy "event_joins_delete_own"
on public.event_joins
for delete
to authenticated
using (user_id = auth.uid());

-- -----------------------------
-- comments
-- public read
-- author-only delete
-- -----------------------------

create policy "comments_select_public"
on public.comments
for select
to anon, authenticated
using (true);

create policy "comments_insert_authenticated"
on public.comments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "comments_delete_own"
on public.comments
for delete
to authenticated
using (user_id = auth.uid());

-- reload schema for API
select pg_notify('pgrst', 'reload schema');