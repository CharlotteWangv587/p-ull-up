import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";

// ─── DELETE /api/comments/:id ────────────────────────────────────────────────
//
// Allowed callers:
//   1. The comment author      comment.user_id === userId
//   2. The event creator       event.created_by === userId
//   3. A backend admin         user.app_metadata.role === "admin"
//
// We use the service-role client for reads/deletion so RLS does not block
// event-creator/admin deletes. Permission checks happen before deletion.

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id?: string; commentId?: string }>;
  }
) {
  try {
    // ── 1. Authenticate ─────────────────────────────────────────────────────
    const userId = await requireUser(request);

    const resolvedParams = await params;

    // Supports both:
    //   src/app/api/comments/[id]/route.ts
    //   src/app/api/comments/[commentId]/route.ts
    const commentId = resolvedParams.id ?? resolvedParams.commentId;

    if (!commentId) {
      return NextResponse.json(
        { ok: false, error: "comment id is required" },
        { status: 400 }
      );
    }

    const service = supabaseService();

    // ── 2. Fetch the comment ────────────────────────────────────────────────
    const { data: comment, error: commentErr } = await service
      .from("comments")
      .select("id, user_id, event_id")
      .eq("id", commentId)
      .maybeSingle();

    if (commentErr) {
      console.error("[DELETE /api/comments/:id] comment fetch error", commentErr);

      return NextResponse.json(
        { ok: false, error: commentErr.message },
        { status: 500 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { ok: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // ── 3. Fetch the parent event ───────────────────────────────────────────
    const { data: event, error: eventErr } = await service
      .from("events")
      .select("id, created_by")
      .eq("id", comment.event_id)
      .maybeSingle();

    if (eventErr) {
      console.error("[DELETE /api/comments/:id] event fetch error", eventErr);

      return NextResponse.json(
        { ok: false, error: eventErr.message },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // ── 4. Admin check ──────────────────────────────────────────────────────
    const { data: adminData, error: adminErr } =
      await service.auth.admin.getUserById(userId);

    if (adminErr) {
      console.error("[DELETE /api/comments/:id] admin lookup error", adminErr);
    }

    const isAdmin = adminData?.user?.app_metadata?.role === "admin";

    // ── 5. Authorization gate ───────────────────────────────────────────────
    const isAuthor = comment.user_id === userId;
    const isEventCreator = event.created_by === userId;

    if (!isAuthor && !isEventCreator && !isAdmin) {
      return NextResponse.json(
        { ok: false, error: "You are not allowed to delete this comment" },
        { status: 403 }
      );
    }

    // ── 6. Delete comment ───────────────────────────────────────────────────
    const { error: deleteErr } = await service
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteErr) {
      console.error("[DELETE /api/comments/:id] delete error", deleteErr);

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

    console.error("[DELETE /api/comments/:id] unexpected", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}