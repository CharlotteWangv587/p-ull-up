import { NextRequest, NextResponse } from "next/server";
import { supabasePublic, supabaseService } from "@/lib/supabase";
import { requireUser, UnauthorizedError } from "@/lib/auth";

// ── GET /api/events ────────────────────────────────────────────────────────────
// Query params:
//   q            - text search (category=event mode)
//   category     - "keyword" | "event" | "campus"
//   tags         - comma-separated tags (keyword/campus mode)
//   campus       - campus slug for results-page filter
//   start_after  - ISO timestamp lower bound on start_time (inclusive)
//   start_before - ISO timestamp upper bound on start_time (exclusive)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q          = searchParams.get("q") ?? "";
  const category   = searchParams.get("category") ?? "keyword";
  const tagsParam  = searchParams.get("tags") ?? "";
  const campus     = searchParams.get("campus") ?? "all";
  const startAfter = searchParams.get("start_after");
  const startBefore = searchParams.get("start_before");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabasePublic as any)
    .from("events")
    .select(
      "id, title, description, start_time, end_time, is_time_tbd, location_name, campus_affiliation, keywords, event_saves(count), event_joins(count)"
    )
    .order("start_time", { ascending: true, nullsFirst: false })
    .limit(100);

  const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

  // ── Text / tag search ─────────────────────────────────────────────────────
  if (category === "event" && q) {
    query = query.ilike("title", `%${q}%`);
  } else if (category === "campus" && tags.length > 0) {
    // Primary: array overlap on campus_affiliation; fallback: location_name ilike
    const campusArray = tags.map((t) => t.charAt(0).toUpperCase() + t.slice(1)); // normalise case
    query = query.or(
      [
        `campus_affiliation.ov.{${campusArray.join(",")}}`,
        ...tags.map((t) => `location_name.ilike.%${t}%`),
      ].join(",")
    );
  } else if (category === "keyword" && tags.length > 0) {
    // Primary: array overlap on keywords; fallback: title/description ilike
    const keywordArray = tags.join(",");
    query = query.or(
      [
        `keywords.ov.{${keywordArray}}`,
        ...tags.flatMap((t) => [`title.ilike.%${t}%`, `description.ilike.%${t}%`]),
      ].join(",")
    );
  } else if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // ── Campus filter (from results-page pill) ────────────────────────────────
  if (campus !== "all") {
    const campusNorm = campus.charAt(0).toUpperCase() + campus.slice(1);
    query = query.or(
      `campus_affiliation.ov.{${campusNorm}},location_name.ilike.%${campus}%`
    );
  }

  // ── Date range ────────────────────────────────────────────────────────────
  const now = new Date().toISOString();
  // TBD events have null start_time — include them unless a specific range is requested
  if (startAfter) {
    query = query.or(`start_time.gte.${startAfter},is_time_tbd.eq.true`);
  } else {
    query = query.or(`start_time.gte.${now},is_time_tbd.eq.true`);
  }
  if (startBefore) {
    query = query.lt("start_time", startBefore);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (data ?? []).map((e: any) => ({
    id:               e.id             as string,
    title:            e.title          as string,
    description:      (e.description   as string | null) ?? "",
    location_name:    e.location_name  as string,
    campus_affiliation: (e.campus_affiliation as string[]) ?? [],
    keywords:         (e.keywords      as string[]) ?? [],
    start_time:       (e.start_time    as string | null) ?? null,
    end_time:         (e.end_time      as string | null) ?? null,
    is_time_tbd:      (e.is_time_tbd   as boolean) ?? false,
    interested_count: (e.event_saves?.[0]?.count as number) ?? 0,
    going_count:      (e.event_joins?.[0]?.count as number) ?? 0,
  }));

  return NextResponse.json({ ok: true, events });
}

// ── Dedupe key helper ─────────────────────────────────────────────────────────
function computeDedupeKey(
  title: string,
  startTime: string | null,
  isTimeTbd: boolean,
  locationName: string
): string {
  const normalizedTitle  = title.toLowerCase().trim();
  const timeBucket       = isTimeTbd || !startTime
    ? "tbd"
    : new Date(startTime).toISOString().slice(0, 13); // hour-level bucket
  const locationBucket   = locationName.toLowerCase().trim();
  return `${normalizedTitle}:${timeBucket}:${locationBucket}`;
}

// ── POST /api/events ──────────────────────────────────────────────────────────
// Creates a new event. Requires auth (Bearer token).
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser(request);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      title,
      description,
      location_name,
      start_time,
      end_time,
      is_time_tbd,
      meetup_location_name,
      meetup_lat,
      meetup_lng,
      campus_affiliation,
      keywords,
      photo_url,
      cost_text,
      spots,
      allow_waitlist,
    } = body as {
      title:                string;
      description?:         string | null;
      location_name:        string;
      start_time?:          string | null;
      end_time?:            string | null;
      is_time_tbd?:         boolean;
      meetup_location_name?: string | null;
      meetup_lat?:          number | null;
      meetup_lng?:          number | null;
      campus_affiliation?:  string[];
      keywords?:            string[];
      photo_url?:           string | null;
      cost_text?:           string | null;
      spots?:               number | null;
      allow_waitlist?:      boolean;
    };

    // ── Validation ────────────────────────────────────────────────────────────
    if (!title?.trim()) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }
    if (!location_name?.trim()) {
      return NextResponse.json({ ok: false, error: "location_name is required" }, { status: 400 });
    }
    const timeTbd = is_time_tbd ?? false;
    if (!timeTbd && !start_time) {
      return NextResponse.json(
        { ok: false, error: "start_time is required when is_time_tbd is false" },
        { status: 400 }
      );
    }
    if (campus_affiliation !== undefined && !Array.isArray(campus_affiliation)) {
      return NextResponse.json({ ok: false, error: "campus_affiliation must be an array" }, { status: 400 });
    }
    if (keywords !== undefined && !Array.isArray(keywords)) {
      return NextResponse.json({ ok: false, error: "keywords must be an array" }, { status: 400 });
    }
    if (spots !== undefined && spots !== null && (!Number.isInteger(spots) || spots < 1)) {
      return NextResponse.json({ ok: false, error: "spots must be a positive integer" }, { status: 400 });
    }

    // ── Dedupe key ────────────────────────────────────────────────────────────
    const dedupeKey = computeDedupeKey(
      title.trim(),
      start_time ?? null,
      timeTbd,
      location_name.trim()
    );

    // ── Insert ────────────────────────────────────────────────────────────────
    const { data, error } = await supabaseService()
      .from("events")
      .insert({
        title:                title.trim(),
        description:          description?.trim() || null,
        location_name:        location_name.trim(),
        start_time:           timeTbd ? null : (start_time ?? null),
        end_time:             end_time || null,
        is_time_tbd:          timeTbd,
        meetup_location_name: meetup_location_name?.trim() || null,
        meetup_lat:           meetup_lat ?? null,
        meetup_lng:           meetup_lng ?? null,
        campus_affiliation:   campus_affiliation ?? [],
        keywords:             keywords ?? [],
        photo_url:            photo_url || null,
        cost_text:            cost_text?.trim() || null,
        spots:                spots ?? null,
        allow_waitlist:       allow_waitlist ?? false,
        source:               "user",
        external_id:          null,
        dedupe_key:           dedupeKey,
        created_by:           userId,
      })
      .select("id")
      .single();

    if (error) {
      // Duplicate event
      if (error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "An identical event already exists (duplicate)" },
          { status: 409 }
        );
      }
      console.error("[POST /api/events]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    console.error("[POST /api/events] unexpected", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
