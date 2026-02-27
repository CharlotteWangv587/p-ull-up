# p-ull up Backend Practical Checklist


## 0) before you start:

- **Only Next.js routes inside `web/src/app/api/**/route.ts` are real endpoints.**
  Anything outside `web/` is not a Next API route.
- **Keep `/api/health` dumb.** It should only prove Next is alive.
- **Use Supabase RLS for permissions.** Don’t rely on “trust me bro” checks in the frontend.

---

## 1) Local dev is alive

### Start the dev server
From repo root:

```bash
cd web
npm install
npm run dev
```

### Confirm Next is alive
(Use the port Next prints, usually 3000.)

```bash
curl -i http://localhost:3000/api/health
```

Done when you get `200` and `{"ok":true}`.

---

## 2) Supabase connectivity

### Put credentials in `web/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
```

### Supabase client helper
Create: `web/src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local");
}

export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export function supabaseAuthed(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
```

### Add a Supabase RPC ping (in Supabase SQL Editor)
Run this block:

```sql
create or replace function public.ping()
returns text
language sql
as $$
  select 'pong';
$$;

grant execute on function public.ping() to anon, authenticated;
select pg_notify('pgrst', 'reload schema');
select public.ping();
```

Done when `select public.ping();` returns `pong`.

### Add endpoint: `GET /api/supabase/health`
Create: `web/src/app/api/supabase/health/route.ts`

```ts
import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabasePublic.rpc("ping");
  if (error) {
    return NextResponse.json(
      { ok: false, error: { message: error.message, code: error.code } },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, ping: data });
}
```

Test:
```bash
curl -i http://localhost:3000/api/supabase/health
```

Done when you get `200` and `{"ok":true,"ping":"pong"}`.

---

## 3) Database schema, structures holding data

Create these tables first:
- `public.profiles`
- `public.events`
- `public.event_saves`
- `public.event_joins`
- `public.comments`

### Required constraints
- `event_saves`: primary key (`user_id`, `event_id`)
- `event_joins`: primary key (`user_id`, `event_id`)
- `events`: unique (`dedupe_key`)
- `events`: unique (`source`, `external_id`) WHERE external_id IS NOT NULL

### Required indexes (minimum)
- `events(start_time)`
- `events(lat, lng)`
- `comments(event_id, created_at)`

Done when you can insert a fake event row in SQL Editor without errors.

---

## 4) RLS policies 

Enable RLS on:
- `profiles`, `events`, `event_saves`, `event_joins`, `comments`

### Policy intent
- **events**
  - SELECT: everyone can read (public feed)
  - INSERT: authenticated users only
  - UPDATE/DELETE: only creator (`created_by = auth.uid()`)
- **event_saves / event_joins**
  - SELECT: only the owner sees their own rows (`user_id = auth.uid()`)
  - INSERT/DELETE: only owner acting on their own row
- **comments**
  - SELECT: everyone can read
  - INSERT: authenticated users only
  - DELETE: only author (`user_id = auth.uid()`)

Done when:
- anon can read events
- a signed-in user can save/join/comment
- a user cannot delete someone else’s stuff

---

## 5) Fix auth in the API, recognize validate token as user

Right now, your stub endpoints only check whether the request includes an Authorization: Bearer <token> header, but they do not verify that the token is valid or tied to a real logged-in user. You should upgrade this by validating the token with Supabase and then returning the authenticated user’s ID (or rejecting the request with 401 if the token is invalid).

### Add: `requireUser()` helper (suggested)
Put in `web/src/lib/api.ts` or a new file like `web/src/lib/auth.ts`:

- Read Bearer token
- Create `supabaseAuthed(token)`
- Call `supabase.auth.getUser()` and return `user.id`
- If invalid: return 401

Done when invalid tokens fail reliably and valid tokens expose `user.id` for inserts.

---

## 6) Implement endpoints in the fastest real app order

Implement the backend endpoints in this order so you get a working app as quickly as possible. 
First, make POST /api/events actually write a new event into the events table by validating the required fields, generating a dedupe_key, inserting the row, and returning a 409 DUPLICATE_EVENT error if the insert fails due to a uniqueness conflict. 
Next, implement GET /api/events?lat&lng&radius_km=... so the app can show a nearby event feed by filtering events using a simple SQL bounding box and optionally refining results with a precise distance calculation in code. 
Then, implement the save and join endpoints (POST/DELETE /api/events/:id/save and POST/DELETE /api/events/:id/join) so users can button saves and joins, relying on the composite primary key to prevent duplicate rows and making repeated requests safe. 
Finally, implement comments (GET /api/events/:id/comments, POST /api/events/:id/comments, and DELETE /api/comments/:id) so users can create and view comments in chronological order and only the comment author is allowed to delete their own comment.

### A) `POST /api/events` (real insert)
- Validate payload (`title`, `location_name`, `start_time`, `lat`, `lng`)
- Compute `dedupe_key` (normalized title + rounded time + location bucket)
- Insert `events`
- If unique constraint hits: return `409 DUPLICATE_EVENT`

Done when curl creates a real event row in Supabase.

### B) `GET /api/events?lat&lng&radius_km=...` (matching feed)

- bounding-box filter in SQL (fast)
- optional Haversine refine in API code (fine for small scale)

Done when nearby events show up and far ones don’t.

### C) Save/Join buttons
- `POST/DELETE /api/events/:id/save`
- `POST/DELETE /api/events/:id/join`
Use the composite PK to prevent duplicates.


Done when toggles are idempotent (repeat request doesn’t break anything).

### D) Comments
- `GET /api/events/:id/comments`
- `POST /api/events/:id/comments`
- `DELETE /api/comments/:id` (author-only)

Done when comments show up in-order and delete is properly restricted.

---

## 7) Task assignment 

In p-ull up, the whole point is getting from “I found an event” to “we actually attended,” including coordination like carpooling and planning.

inside an event page, people can create little to-dos and assign them to members, like:

“Driver: who can take 3 people?”

“Bring snacks”

“Buy parking pass”

“Bring speaker / charger”

“Set up meeting point”

For in-app task assignment (bring stuff, drive, setup, cleanup), add these:


### Table: `public.event_tasks`
Columns:
- `id` uuid pk
- `event_id` uuid fk -> events (ON DELETE CASCADE)
- `title` text not null
- `details` text null
- `status` text not null default 'open'  -- open|done
- `due_at` timestamptz null
- `created_by` uuid not null (auth uid / profile id)
- `created_at` timestamptz default now()

### Table: `public.event_task_assignees`
Columns:
- `task_id` uuid fk -> event_tasks (ON DELETE CASCADE)
- `user_id` uuid fk -> profiles
Primary key: (`task_id`, `user_id`)

### RLS intent
- Only users who **joined** an event can view/create tasks for that event.
- Only task creator or assignee can update status.
- Only task creator can delete the task (optional).

### Endpoints (simple)
- `GET /api/events/:id/tasks` list tasks
- `POST /api/events/:id/tasks` create task
- `POST /api/tasks/:taskId/assign` assign user(s)
- `POST /api/tasks/:taskId/unassign` unassign user(s)
- `POST /api/tasks/:taskId/toggle` mark open/done

key assignments:
- joined users can create tasks
- non-joined users can’t see tasks
- assignees can mark done

---

## 8) backend layout

1. **DB tables + indexes**
   - Create tables: profiles, events, saves, joins, comments
   - Add constraints + indexes
2. **RLS policies**
   - Enable RLS + add baseline policies
3. **Auth helper**
   - Implement `requireUser()` (JWT validation)
4. **Events insert**
   - Implement `POST /api/events` with dedupe_key + 409 on duplicate
5. **Matching feed**
   - Implement `GET /api/events` with radius (bbox + optional refine)
6. **Save/Join**
   - Implement toggles (idempotent)
7. **Comments**
   - Implement list/create/delete
8. **(Optional) Tasks**
   - Implement event_tasks + assignment endpoints

---

## 9) Quick troubleshooting cheats

- **404 on an API route**: file is not in `web/src/app/api/.../route.ts` or dev server didn’t restart.
- **PGRST202 ping not found**: you didn’t grant execute or reload schema, or you created it in the wrong Supabase project.
- **Everything is 401/403**: RLS is on (good) but your token validation or policies are wrong (fix policies, don’t turn off RLS).
- **Next dev lock issue**: `rm -rf web/.next` and restart.

