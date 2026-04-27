import { NextRequest, NextResponse } from "next/server";
import { supabasePublic, supabaseService } from "@/lib/supabase";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/events/:id ───────────────────────────────────────────────────────
// Public — returns full event data.
// If caller provides a valid Bearer token, also returns viewer_has_saved /
// viewer_has_joined flags.
export async function GET(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;

  // Fetch the event (public)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: event, error } = await (supabasePublic as any)
    .from("events")
    .select(
      `id, title, description,
       start_time, end_time, is_time_tbd,
       location_name, lat, lng,
       meetup_location_name, meetup_lat, meetup_lng,
       campus_affiliation, keywords,
       photo_url, cost_text, spots, allow_waitlist,
       created_by, created_at,
       event_saves(count), event_joins(count)`
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    console.error("[GET /api/events/:id]", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!event) {
    return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
  }

  // Try to resolve optional viewer flags
  let viewer_has_saved  = false;
  let viewer_has_joined = false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const userId = await requireUser(request);
      const [saveRow, joinRow] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabasePublic as any)
          .from("event_saves")
          .select("user_id")
          .eq("user_id", userId)
          .eq("event_id", eventId)
          .maybeSingle(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabasePublic as any)
          .from("event_joins")
          .select("user_id")
          .eq("user_id", userId)
          .eq("event_id", eventId)
          .maybeSingle(),
      ]);
      viewer_has_saved  = !!saveRow.data;
      viewer_has_joined = !!joinRow.data;
    } catch {
      // Invalid / missing token — viewer flags stay false, still return event
    }
  }

  return NextResponse.json({
    ok: true,
    event: {
      id:                   event.id,
      title:                event.title,
      description:          event.description ?? null,
      start_time:           event.start_time ?? null,
      end_time:             event.end_time   ?? null,
      is_time_tbd:          event.is_time_tbd ?? false,
      location_name:        event.location_name,
      lat:                  event.lat         ?? null,
      lng:                  event.lng         ?? null,
      meetup_location_name: event.meetup_location_name ?? null,
      meetup_lat:           event.meetup_lat  ?? null,
      meetup_lng:           event.meetup_lng  ?? null,
      campus_affiliation:   event.campus_affiliation ?? [],
      keywords:             event.keywords    ?? [],
      photo_url:            event.photo_url   ?? null,
      cost_text:            event.cost_text   ?? null,
      spots:                event.spots       ?? null,
      allow_waitlist:       event.allow_waitlist ?? false,
      created_by:           event.created_by,
      created_at:           event.created_at,
      save_count:           (event.event_saves?.[0]?.count  as number) ?? 0,
      join_count:           (event.event_joins?.[0]?.count as number) ?? 0,
      viewer_has_saved,
      viewer_has_joined,
    },
  });
}

// ── DELETE /api/events/:id ────────────────────────────────────────────────────
// Requires auth. Only the event creator may delete.
// ON DELETE CASCADE on event_saves / event_joins removes related rows automatically.
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireUser(request);
    const { id: eventId } = await params;

    // Fetch event to verify existence and ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: event, error: fetchError } = await (supabasePublic as any)
      .from("events")
      .select("id, created_by")
      .eq("id", eventId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
    }
    if (!event) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }
    if (event.created_by !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabaseService()
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      console.error("[DELETE /api/events/:id]", deleteError);
      return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    console.error("[DELETE /api/events/:id] unexpected", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
