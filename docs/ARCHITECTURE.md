# Architecture

## What we are building
p-ull up is a full-stack web app. Users can log in, browse/post events, and signal interest (save) vs attendance (join).

## Stack (core)
- Frontend: Next.js (TypeScript) in `/web`
- Backend API: Next.js Route Handlers in `/web/src/app/api/*`
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (Google + email/password)
- Deployment: Vercel

## Optional later (not required)
- Python services for simulation / batch logic under `/services/simulation` (FastAPI/Celery/etc.)

## Folder responsibilities
- `/web`: the app (UI + API routes)
- `/docs`: documentation (setup, schema, API contract)
- `/services/simulation`: optional Python simulation + batch logic
- `/supabase`: optional migrations / RLS policy scripts (added when needed)



## Rules
- Do not create a separate “backend server” folder .
- API endpoints must go under `/web/src/app/api/*`.
- Private information to the project never go in Git. Use `web/.env.local`.

        “Private information” includes anything that would let someone:

        access your database,
        impersonate a user or your server,
        call paid APIs on your dime,
        or generally do crimes in your name.

        Examples:

        Supabase service role key;
        database password / connection string
        API keys (Google, OpenAI, Mapbox, Ticketmaster, Eventbrite, etc.);
        webhook signing secrets;
        JWT signing keys;
        any “admin” token

        These must never be committed to Git
