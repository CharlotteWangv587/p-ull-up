import { NextRequest, NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

// Campus name → location_name search terms
const CAMPUS_TERMS: Record<string, string[]> = {
  pomona:  ["pomona"],
  cmc:     ["cmc", "claremont mckenna"],
  scripps: ["scripps"],
  mudd:    ["harvey mudd", "mudd"],
  pitzer:  ["pitzer"],
};

// GET /api/events
// Query params:
//   q            - text search (category=event mode)
//   category     - "keyword" | "event" | "campus"
//   tags         - comma-separated tags (keyword/campus mode)
//   campus       - campus slug for results-page filter (pomona|cmc|scripps|mudd|pitzer)
//   start_after  - ISO timestamp lower bound on start_time (inclusive)
//   start_before - ISO timestamp upper bound on start_time (exclusive)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "keyword";
  const tagsParam = searchParams.get("tags") ?? "";
  const campus = searchParams.get("campus") ?? "all";
  const startAfter = searchParams.get("start_after");
  const startBefore = searchParams.get("start_before");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabasePublic as any)
    .from("events")
    .select(
      "id, title, description, start_time, end_time, location_name, event_saves(count), event_joins(count)"
    )
    .order("start_time", { ascending: true })
    .limit(100);

  const tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);

  // ── Text / tag search ─────────────────────────────────────────────────────
  if (category === "event" && q) {
    query = query.ilike("title", `%${q}%`);
  } else if (category === "campus" && tags.length > 0) {
    const orFilter = tags.map((t) => `location_name.ilike.%${t}%`).join(",");
    query = query.or(orFilter);
  } else if (category === "keyword" && tags.length > 0) {
    const orFilter = tags
      .flatMap((t) => [`title.ilike.%${t}%`, `description.ilike.%${t}%`])
      .join(",");
    query = query.or(orFilter);
  } else if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // ── Campus filter (from results-page dropdown) ────────────────────────────
  const campusTerms = CAMPUS_TERMS[campus];
  if (campusTerms) {
    const orFilter = campusTerms.map((t) => `location_name.ilike.%${t}%`).join(",");
    query = query.or(orFilter);
  }

  // ── Date range ────────────────────────────────────────────────────────────
  const now = new Date().toISOString();
  query = query.gte("start_time", startAfter ?? now);

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
    id: e.id as string,
    title: e.title as string,
    description: (e.description as string | null) ?? "",
    location_name: e.location_name as string,
    start_time: e.start_time as string,
    end_time: (e.end_time as string | null) ?? null,
    interested_count: (e.event_saves?.[0]?.count as number) ?? 0,
    going_count: (e.event_joins?.[0]?.count as number) ?? 0,
  }));

  return NextResponse.json({ ok: true, events });
}
