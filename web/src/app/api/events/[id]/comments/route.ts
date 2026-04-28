import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { supabasePublic, supabaseService } from "@/lib/supabase";

// ─── GET /api/events/:id/comments ───────────────────────────────────────────
// Publicly lists comments for one event.

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "event id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabasePublic
      .from("comments")
      .select("id, event_id, user_id, body, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GET /api/events/:id/comments]", error);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      comments: data ?? [],
    });
  } catch (error) {
    console.error("[GET /api/events/:id/comments] unexpected", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/events/:id/comments ──────────────────────────────────────────
// Creates a comment for one event. Requires auth.

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "event id is required" },
        { status: 400 }
      );
    }

    let bodyJson: { body?: unknown };

    try {
      bodyJson = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const commentBody =
      typeof bodyJson.body === "string" ? bodyJson.body.trim() : "";

    if (!commentBody) {
      return NextResponse.json(
        { ok: false, error: "Comment body is required" },
        { status: 400 }
      );
    }

    const service = supabaseService();

    // 1. Confirm the parent event exists.
    const { data: event, error: eventError } = await service
      .from("events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("[POST /api/events/:id/comments] event lookup", eventError);

      return NextResponse.json(
        { ok: false, error: eventError.message },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 2. Ensure the user has a matching profile row.
    // Your comments table references public.profiles(id), not auth.users(id).
    const { error: profileError } = await service
      .from("profiles")
      .upsert(
        {
          id: userId,
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error("[POST /api/events/:id/comments] profile upsert", profileError);

      return NextResponse.json(
        { ok: false, error: profileError.message },
        { status: 500 }
      );
    }

    // 3. Insert the comment.
    const { data: comment, error: insertError } = await service
      .from("comments")
      .insert({
        event_id: eventId,
        user_id: userId,
        body: commentBody,
      })
      .select("id, event_id, user_id, body, created_at")
      .single();

    if (insertError) {
      console.error("[POST /api/events/:id/comments] insert", insertError);

      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401 }
      );
    }

    console.error("[POST /api/events/:id/comments] unexpected", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}