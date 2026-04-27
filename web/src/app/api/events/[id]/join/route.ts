import { NextRequest, NextResponse } from "next/server";
import { supabasePublic, supabaseService } from "@/lib/supabase";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function resolveEvent(eventId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabasePublic as any)
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  return data;
}

// ── POST /api/events/:id/join ────────────────────────────────────────────────
// Mark the authenticated user as going to this event.
// Idempotent — if the row already exists, return 204 anyway.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    if (!(await resolveEvent(eventId))) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const { error } = await supabaseService()
      .from("event_joins")
      .insert({ user_id: userId, event_id: eventId });

    if (error && error.code !== "23505") {
      // 23505 = unique_violation → row already exists, treat as success
      console.error("[POST /api/events/:id/join]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    console.error("[POST /api/events/:id/join] unexpected", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/events/:id/join ──────────────────────────────────────────────
// Remove the authenticated user's join from this event.
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    if (!(await resolveEvent(eventId))) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const { error } = await supabaseService()
      .from("event_joins")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);

    if (error) {
      console.error("[DELETE /api/events/:id/join]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    console.error("[DELETE /api/events/:id/join] unexpected", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
