This document defines the MVP database schema for p-ull up.

**Core requirements from proposal**
- User management: Supabase Auth
- Event posting + duplicate prevention
- Social signaling: Save/Like + Join

**Reach goals**
- Comments
- Messaging (DMs)

---

## Key idea: Supabase Auth owns accounts
Supabase creates users in `auth.users`.

We create our own `public.profiles` table to store app-facing user info.

---

# Tables (MVP)

## 1) public.profiles
Stores public user profile data linked to auth.

Columns:
- `id` uuid PRIMARY KEY, references `auth.users.id`
- `display_name` text (optional)
- `avatar_url` text (optional)
- `created_at` timestamptz default now()

Notes:
- Insert into `profiles` can be done via:
  - frontend after sign-up, or
  - a DB trigger (recommended later)

---

## 2) public.events
Stores event listings.

Columns:
- `id` uuid PRIMARY KEY default gen_random_uuid()
- `title` text NOT NULL
- `description` text NULL
- `start_time` timestamptz NOT NULL
- `end_time` timestamptz NULL
- `location_name` text NOT NULL
- `lat` double precision NOT NULL
- `lng` double precision NOT NULL
- `radius_km` double precision NOT NULL default 10
- `source` text NOT NULL default 'user'  -- user|ticketmaster|eventbrite
- `external_id` text NULL               -- ID from Ticketmaster/Eventbrite if imported
- `dedupe_key` text NOT NULL            -- computed by app to prevent duplicates
- `created_by` uuid NOT NULL references public.profiles(id)
- `created_at` timestamptz NOT NULL default now()

Indexes / constraints:
- UNIQUE (`source`, `external_id`) WHERE external_id IS NOT NULL
- UNIQUE (`dedupe_key`)

Why dedupe_key exists:
- For imported events: dedupe_key can be `source:external_id`
- For user posts: dedupe_key can be computed from normalized fields:
  - lower(title) + start_time (rounded) + approx location bucket

We keep this rule simple so beginners can implement it safely.

---

## 3) public.event_saves
Stores Save/Like signals.

Columns:
- `user_id` uuid references public.profiles(id)
- `event_id` uuid references public.events(id)
- `created_at` timestamptz default now()

Constraints:
- PRIMARY KEY (`user_id`, `event_id`)  -- prevents double saves

---

## 4) public.event_joins
Stores Join/Attend signals.

Columns:
- `user_id` uuid references public.profiles(id)
- `event_id` uuid references public.events(id)
- `created_at` timestamptz default now()

Constraints:
- PRIMARY KEY (`user_id`, `event_id`)  -- prevents double joins

---

# Tables (Reach Goals)

## 5) public.comments
Columns:
- `id` uuid PRIMARY KEY default gen_random_uuid()
- `event_id` uuid NOT NULL references public.events(id) ON DELETE CASCADE
- `user_id` uuid NOT NULL references public.profiles(id)
- `body` text NOT NULL
- `created_at` timestamptz default now()

Index:
- INDEX on (`event_id`, `created_at`)

---

## 6) Messaging (optional)
Only define after core is stable.

Likely tables:
- `conversations` (id, created_at, maybe event_id)
- `conversation_members` (conversation_id, user_id)
- `messages` (id, conversation_id, sender_id, body, created_at)

Messaging requires strict RLS; do not build until core is solid.

---

# Row Level Security (RLS) plan (Supabase)

We will enable RLS and add policies.

## public.events
- SELECT: allow everyone (public feed)
- INSERT: allow authenticated users
- DELETE: allow only creator (`created_by = auth.uid()`)
- UPDATE: allow only creator (optional)

## public.event_saves / public.event_joins
Privacy-friendly MVP:
- SELECT: allow only owner rows (`user_id = auth.uid()`)
- INSERT: allow only authenticated user inserting their own row
- DELETE: allow only owner deleting their own row

Counts:
- To show save_count/join_count without exposing user lists, we can compute counts using:
  - a view, or
  - a function, or
  - server-side query with elevated privileges (later)

## public.comments
- SELECT: allow everyone
- INSERT: allow authenticated users
- DELETE: allow only author (`user_id = auth.uid()`)

---

# Proximity Matching (MVP approach)
For MVP we store `lat` and `lng` as floats and do one of:
1) simple bounding-box filter in SQL, then refine in app, or
2) Postgres extensions (later): PostGIS / earthdistance for true radius queries

We will start simple, then improve.

---

# What to implement first (backend)
1) Supabase project + tables above
2) RLS policies for events/saves/joins
3) API endpoints that read/write these tables
4) Only then: comments, then DMs

