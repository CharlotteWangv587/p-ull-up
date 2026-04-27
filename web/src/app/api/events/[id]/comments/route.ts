import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { supabaseAuthed, supabaseService } from "@/lib/supabase";

// GET /api/events/[id]/comments
// Public — uses service role to join profiles so display names are visible.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  const { data, error } = await supabaseService()
    .from("comments")
    .select("id, body, created_at, user_id, profiles(display_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = (data ?? []).map((c: any) => ({
    id: c.id as string,
    author: {
      id: c.user_id as string,
      name: (c.profiles?.display_name as string | null) ?? "User",
    },
    body: c.body as string,
    createdAt: new Date(c.created_at as string).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    replies: [],
  }));

  return NextResponse.json({ ok: true, comments });
}

// POST /api/events/[id]/comments
// Requires auth. Inserts a comment and returns it.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser(request);
    const tok = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const { id: eventId } = await params;

    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ ok: false, error: "body is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAuthed(tok)
      .from("comments")
      .insert({ event_id: eventId, user_id: userId, body: body.trim() })
      .select("id, body, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const { data: profile } = await supabaseService()
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      ok: true,
      comment: {
        id: data.id,
        author: { id: userId, name: profile?.display_name ?? "You" },
        body: data.body,
        createdAt: "Just now",
        replies: [],
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error("[POST /api/events/:id/comments]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
