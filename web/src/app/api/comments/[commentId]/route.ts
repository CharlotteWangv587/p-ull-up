import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { supabaseAuthed, supabaseService } from "@/lib/supabase";

// ─── DELETE /api/comments/:commentId ─────────────────────────────────────────
//
// Allowed callers:
//   1. The comment's author (comment.user_id === userId)
//   2. The event creator  (event.created_by === userId)
//   3. A backend admin    (user.app_metadata.role === "admin")
//
// The service-role client is used for the actual deletion so that RLS does not
// block event-creator / admin deletes.  Identity checks are done in application
// code before reaching that point.

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    // ── 1. Authenticate ───────────────────────────────────────────────────────
    const userId = await requireUser(request);
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

    const { commentId } = await params;

    // ── 2. Fetch the comment ──────────────────────────────────────────────────
    const authed = supabaseAuthed(token);

    const { data: comment, error: commentErr } = await authed
      .from("comments")
      .select("id, user_id, event_id")
      .eq("id", commentId)
      .single();

    if (commentErr || !comment) {
      return NextResponse.json(
        { ok: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // ── 3. Fetch the parent event to check creator ────────────────────────────
    const { data: event, error: eventErr } = await authed
      .from("events")
      .select("id, created_by")
      .eq("id", comment.event_id)
      .single();

    if (eventErr || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // ── 4. Admin check via service role ───────────────────────────────────────
    const service = supabaseService();
    const { data: adminData } = await service.auth.admin.getUserById(userId);
    const isAdmin =
      adminData?.user?.app_metadata?.role === "admin";

    // ── 5. Authorisation gate ─────────────────────────────────────────────────
    const isAuthor = comment.user_id === userId;
    const isEventCreator = event.created_by === userId;

    if (!isAuthor && !isEventCreator && !isAdmin) {
      return NextResponse.json(
        { ok: false, error: "You are not allowed to delete this comment" },
        { status: 403 }
      );
    }

    // ── 6. Delete (service role bypasses RLS for non-author callers) ──────────
    const { error: deleteErr } = await service
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteErr) {
      return NextResponse.json(
        { ok: false, error: deleteErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401 }
      );
    }
    console.error("[DELETE /api/comments/:commentId]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
