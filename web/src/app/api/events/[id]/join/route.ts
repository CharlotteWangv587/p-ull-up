import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { supabaseAuthed } from "@/lib/supabase";

function token(request: NextRequest) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    const { error } = await supabaseAuthed(token(request))
      .from("event_joins")
      .insert({ user_id: userId, event_id: eventId });

    if (error && error.code !== "23505") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    const { error } = await supabaseAuthed(token(request))
      .from("event_joins")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
