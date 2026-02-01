# p-ull up

A social-coordination platform that bridges the gap between “finding an event” and “actually attending,” by matching nearby event-goers and supporting logistics (e.g., group attendance and carpool coordination).  
This project is designed as a full-stack learning experience with an emphasis on shipping core features first.

## Tech Stack (from proposal)
**SWE stack**
- Language: TypeScript
- Frontend: Next.js (TypeScript), Tailwind CSS (optional)
- Backend: Next.js route handlers (API endpoints inside the Next.js app)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (Google + email/password)
- Deployment: Vercel

**Data / Simulation stack (optional)**
- Language: Python
- API endpoints for Python logic: FastAPI
- Background jobs: Celery
- Data processing: pandas
- Simulation: Mesa
- Optimization: OR-Tools
- Packaging: Docker

## Core Deliverables (Priority 1)
1. User Management: basic account creation + secure login  
2. Event Posting: post events + prevent duplicates (compare new posts against existing DB)  
3. Social Signaling: Like/Save and Join to distinguish interest vs committed attendance

## Reach Goals (Priority 2, time permitting)
- Comments on event posts
- Direct messaging for logistics planning

---

## Repository Structure

### `/web` — The App (Frontend + Backend API)
This is the Next.js application. It contains:
- **Frontend UI**: pages/components
- **Backend API**: Next.js route handlers under `src/app/api/*`

Where work happens:
- Frontend: `web/src/app/*` (pages) and `web/src/components/*` (if you create it)
- Backend endpoints: `web/src/app/api/<route>/route.ts`
- Shared utilities (recommended): `web/src/lib/*`

Run locally:
```bash
cd web
npm install
npm run dev
