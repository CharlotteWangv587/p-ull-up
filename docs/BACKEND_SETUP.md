# =========================
# Create API route handler stubs + shared helpers
# Run from repo root
# =========================

# 0) Sanity check you are in repo root (should list web/ and docs/)
ls

# 1) Create folders for API routes (Next.js App Router)
mkdir -p web/src/app/api/health
mkdir -p web/src/app/api/events
mkdir -p web/src/app/api/events/\[id\]
mkdir -p web/src/app/api/events/\[id\]/save
mkdir -p web/src/app/api/events/\[id\]/join
mkdir -p web/src/app/api/events/\[id\]/comments
mkdir -p web/src/app/api/comments/\[id\]

# 2) Create a small shared helper for consistent errors + auth token parsing
mkdir -p web/src/lib

cat > web/src/lib/api.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "DUPLICATE_EVENT"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

export function jsonError(status: number, code: ApiErrorCode, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: { code, message }, ...(extra ?? {}) },
    { status }
  );
}

/**
 * For core stubs we support Bearer tokens for manual testing (curl/Postman).
 * Later, we can add cookie-based Supabase session handling.
 */
export function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function requireBearerAuth(req: NextRequest): string | NextResponse {
  const token = getBearerToken(req);
  if (!token) {
    return jsonError(401, "UNAUTHORIZED", "Missing Authorization: Bearer <token> header.");
  }
  return token;
}
EOF

# 3) Health endpoint: GET /api/health
cat > web/src/app/api/health/route.ts << 'EOF'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}
EOF

# 4) Events collection: GET /api/events and POST /api/events
cat > web/src/app/api/events/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireBearerAuth } from "@/lib/api";

export async function GET(req: NextRequest) {
  //core stub: parse query params but return empty feed for now.
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");

  if ((lat && !lng) || (!lat && lng)) {
    return jsonError(400, "BAD_REQUEST", "lat and lng must be provided together.");
  }

  return NextResponse.json({
    items: [],
    next_cursor: null
  });
}

export async function POST(req: NextRequest) {
  // core stub: require auth and return a generated event_id.
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Request body must be valid JSON.");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const location_name = typeof body.location_name === "string" ? body.location_name.trim() : "";
  const start_time = typeof body.start_time === "string" ? body.start_time : "";

  if (!title || title.length > 120) {
    return jsonError(400, "BAD_REQUEST", "title is required and must be 1–120 characters.");
  }
  if (!location_name) {
    return jsonError(400, "BAD_REQUEST", "location_name is required.");
  }
  if (!start_time || Number.isNaN(Date.parse(start_time))) {
    return jsonError(400, "BAD_REQUEST", "start_time must be a valid ISO timestamp string.");
  }

  // TODO: Insert into Supabase `events` table and implement dedupe.
  // For now, return a generated UUID to unblock frontend wiring.
  const event_id = crypto.randomUUID();
  return NextResponse.json({ event_id }, { status: 201 });
}
EOF

# 5) Event detail: GET /api/events/:id and DELETE /api/events/:id (optional)
cat > web/src/app/api/events/\[id\]/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireBearerAuth } from "@/lib/api";

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  // TODO: Fetch from Supabase `events` by id.
  // Stub response:
  return NextResponse.json({
    item: {
      id,
      title: "Stub Event",
      description: "This is a placeholder until DB is wired.",
      start_time: new Date().toISOString(),
      end_time: null,
      location_name: "TBD",
      lat: 34.0,
      lng: -118.0,
      source: "user",
      external_id: null,
      created_by: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      save_count: 0,
      join_count: 0,
      viewer_has_saved: false,
      viewer_has_joined: false
    }
  });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  // Optional feature: allow deleting events created by the user.
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: check creator and delete in Supabase.
  // Stub: behave as if deleted.
  return new NextResponse(null, { status: 204 });
}
EOF

# 6) Save: POST /api/events/:id/save and DELETE /api/events/:id/save
cat > web/src/app/api/events/\[id\]/save/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { requireBearerAuth } from "@/lib/api";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: insert into Supabase `event_saves` (user_id, event_id)
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: delete from Supabase `event_saves` where (user_id, event_id)
  return new NextResponse(null, { status: 204 });
}
EOF

# 7) Join: POST /api/events/:id/join and DELETE /api/events/:id/join
cat > web/src/app/api/events/\[id\]/join/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { requireBearerAuth } from "@/lib/api";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: insert into Supabase `event_joins` (user_id, event_id)
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: delete from Supabase `event_joins` where (user_id, event_id)
  return new NextResponse(null, { status: 204 });
}
EOF

# 8) Comments: GET /api/events/:id/comments and POST /api/events/:id/comments (reach goal)
cat > web/src/app/api/events/\[id\]/comments/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireBearerAuth } from "@/lib/api";

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const { id: event_id } = ctx.params;

  // TODO: read from Supabase `comments` filtered by event_id
  return NextResponse.json({ items: [] });
}

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id: event_id } = ctx.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Request body must be valid JSON.");
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return jsonError(400, "BAD_REQUEST", "body is required.");
  }

  // TODO: insert into Supabase `comments` (event_id, user_id, body)
  const comment_id = crypto.randomUUID();
  return NextResponse.json({ comment_id }, { status: 201 });
}
EOF

# 9) Delete comment: DELETE /api/comments/:id (reach goal)
cat > web/src/app/api/comments/\[id\]/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { requireBearerAuth } from "@/lib/api";

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = requireBearerAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = ctx.params;

  // TODO: only author can delete. delete from Supabase `comments` by id.
  return new NextResponse(null, { status: 204 });
}
EOF

# 10) Done message + quick file list check
echo "API stubs created. Key files:"
ls -R web/src/app/api | sed -n '1,200p'
