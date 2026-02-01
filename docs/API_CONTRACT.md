This document defines the backend API for p-ull up.

**Project goals from proposal**
- Core (Priority 1): User management (Supabase Auth), Event posting (with duplicate prevention), Social signaling (Save/Like + Join)
- Reach (Priority 2): Comments + DMs for logistics

---

## Where the backend lives (important)
Backend endpoints are implemented as **Next.js Route Handlers** inside `web/`.

Path mapping:
- `GET /api/health` -> `web/src/app/api/health/route.ts`
- `GET /api/events` -> `web/src/app/api/events/route.ts`
- `GET /api/events/:id` -> `web/src/app/api/events/[id]/route.ts`
- etc.

---

## Conventions

### Base URL (local dev)
Your dev server prints the URL and port:
- Example: `http://localhost:3000` or `http://localhost:3001`

When testing with curl, always use the port the server prints.

### JSON
All endpoints return JSON except `204 No Content`.

### Auth (Supabase)
- Login/Sign-up happens via Supabase Auth (frontend).
- API endpoints that modify data require an authenticated user.

For manual testing, we allow:
- `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`
(This is mainly for curl/Postman while we learn.)

### Standard error format
Non-2xx responses should be:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message"
  }
}
Status codes
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error

Data shapes
Event (response shape)
{
  "id": "uuid",
  "title": "string",
  "description": "string or null",
  "start_time": "ISO timestamp",
  "end_time": "ISO timestamp or null",
  "location_name": "string",
  "lat": 34.0000,
  "lng": -118.0000,
  "radius_km": 10,
  "source": "user|ticketmaster|eventbrite",
  "external_id": "string or null",
  "created_by": "uuid",
  "created_at": "ISO timestamp",
  "save_count": 0,
  "join_count": 0,
  "viewer_has_saved": false,
  "viewer_has_joined": false
}
Notes:

viewer_has_* only meaningful when viewer is authenticated.

For core features, counts can be computed by query (or returned as 0 until wired).

Endpoints
1) Health
GET /api/health
Purpose: verify backend routing works.

Response 200:

{ "ok": true }
2) Events (Core)
GET /api/events
Purpose: event feed with optional proximity filter.

Query params (optional):

lat (float) + lng (float): must be provided together

radius_km (float, default 10)

starts_after (ISO timestamp, default now)

limit (int, default 20, max 50)

cursor (string): pagination cursor (future)

source (string): filter by source (future)

Response 200:

{
  "items": [ /* Event[] */ ],
  "next_cursor": "string or null"
}
Errors:

400 if only one of lat/lng is provided or invalid numbers

GET /api/events/:id
Purpose: event detail.

Response 200:

{ "item": { /* Event */ } }
Errors:

404 if not found

POST /api/events (Authenticated)
Purpose: create an event listing.

Request headers:

Requires auth session or Authorization: Bearer <token>

Request body:

{
  "title": "string (required)",
  "description": "string (optional)",
  "start_time": "ISO string (required)",
  "end_time": "ISO string (optional)",
  "location_name": "string (required)",
  "lat": 34.0,
  "lng": -118.0,
  "source": "user (default)",
  "external_id": "string (optional for imported events)"
}
Validation:

title length 1–120

start_time must be parseable ISO timestamp

lat in [-90, 90], lng in [-180, 180]

Duplicate prevention (Core requirement):

If source + external_id exists already -> 409 conflict

If user-posted event appears identical by our dedupe rules -> 409 conflict

Response 201:

{ "event_id": "uuid" }
Response 409:

{
  "error": { "code": "DUPLICATE_EVENT", "message": "An equivalent event already exists." },
  "existing_event_id": "uuid"
}
DELETE /api/events/:id (Authenticated, creator only)
Purpose: delete an event you created.

Response 204

Errors:

401 not logged in

403 not creator

404 not found

3) Social Signaling (Core)
POST /api/events/:id/save (Authenticated)
Purpose: Save/Like an event (interest signal).

Response 204

DELETE /api/events/:id/save (Authenticated)
Purpose: remove save.

Response 204

POST /api/events/:id/join (Authenticated)
Purpose: Join/Attend an event (commitment signal).

Response 204

DELETE /api/events/:id/join (Authenticated)
Purpose: un-join.

Response 204

4) Comments (Reach goal)
GET /api/events/:id/comments
Response 200:

{
  "items": [
    { "id": "uuid", "event_id": "uuid", "user_id": "uuid", "body": "string", "created_at": "ISO timestamp" }
  ]
}
POST /api/events/:id/comments (Authenticated)
Request:

{ "body": "string" }
Response 201:

{ "comment_id": "uuid" }
DELETE /api/comments/:id (Authenticated, author only)
Response 204

5) Messaging (Reach goal, optional)
Not implemented until core features are stable.

Planned concepts:

conversations (possibly tied to an event)

messages inside conversations

strict access control: only participants can read/write

Quick manual tests (curl)
Health:

curl -i http://localhost:3000/api/health
List events:

curl -i "http://localhost:3000/api/events?limit=5"
Create event (requires token):

curl -i -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>" \
  -d '{
    "title": "Off-campus concert",
    "description": "Going with friends",
    "start_time": "2026-02-10T03:00:00Z",
    "location_name": "LA Venue",
    "lat": 34.0522,
    "lng": -118.2437
  }'
