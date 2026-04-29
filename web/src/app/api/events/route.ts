import { NextRequest, NextResponse } from "next/server";
import { supabasePublic, supabaseService } from "@/lib/supabase";
import { requireUser, UnauthorizedError } from "@/lib/auth";

export const runtime = "nodejs";

const EVENT_POSTER_BUCKET = "event-posters";
const MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_POSTER_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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
  "id, title, description, start_time, end_time, is_time_tbd, location_name, campus_affiliation, keywords, photo_url, photo_path, event_saves(count), event_joins(count)"
)
    .order("start_time", { ascending: true, nullsFirst: false })
    .limit(100);

  const tags = tagsParam
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  // ── Text / tag search ─────────────────────────────────────────────────────
  if (category === "event" && q) {
    query = query.ilike("title", `%${q}%`);
  } else if (category === "campus" && tags.length > 0) {
    const campusArray = tags.map((t) => t.charAt(0).toUpperCase() + t.slice(1));

    query = query.or(
      [
        `campus_affiliation.ov.{${campusArray.join(",")}}`,
        ...tags.map((t) => `location_name.ilike.%${t}%`),
      ].join(",")
    );
  } else if (category === "keyword" && tags.length > 0) {
    const keywordArray = tags.join(",");

    query = query.or(
      [
        `keywords.ov.{${keywordArray}}`,
        ...tags.flatMap((t) => [
          `title.ilike.%${t}%`,
          `description.ilike.%${t}%`,
        ]),
      ].join(",")
    );
  } else if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // ── Campus filter ─────────────────────────────────────────────────────────
  if (campus !== "all") {
    const campusNorm = campus.charAt(0).toUpperCase() + campus.slice(1);

    query = query.or(
      `campus_affiliation.ov.{${campusNorm}},location_name.ilike.%${campus}%`
    );
  }

  // ── Date range ────────────────────────────────────────────────────────────
  const now = new Date().toISOString();

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
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (data ?? []).map((e: any) => ({
    id: e.id as string,
    title: e.title as string,
    description: (e.description as string | null) ?? "",
    location_name: e.location_name as string,
    campus_affiliation: (e.campus_affiliation as string[]) ?? [],
    keywords: (e.keywords as string[]) ?? [],
    start_time: (e.start_time as string | null) ?? null,
    end_time: (e.end_time as string | null) ?? null,
    is_time_tbd: (e.is_time_tbd as boolean) ?? false,
    photo_url: (e.photo_url as string | null) ?? null,
    photo_path: (e.photo_path as string | null) ?? null,
    interested_count: (e.event_saves?.[0]?.count as number) ?? 0,
    going_count: (e.event_joins?.[0]?.count as number) ?? 0,
  }));

  return NextResponse.json({ ok: true, events });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeDedupeKey(
  title: string,
  startTime: string | null,
  isTimeTbd: boolean,
  locationName: string
): string {
  const normalizedTitle = title.toLowerCase().trim();

  const timeBucket =
    isTimeTbd || !startTime
      ? "tbd"
      : new Date(startTime).toISOString().slice(0, 13);

  const locationBucket = locationName.toLowerCase().trim();

  return `${normalizedTitle}:${timeBucket}:${locationBucket}`;
}

function toNumberOrDefault(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") return fallback;

  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const n = Number(value);

  return Number.isFinite(n) ? n : null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Fall back to comma-separated parsing below.
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toPositiveIntegerOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const n = Number(value);

  if (!Number.isInteger(n) || n < 1) return null;

  return n;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function formValue(formData: FormData, key: string): unknown {
  return formData.get(key);
}

function getPosterExtension(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";

  return "bin";
}

async function uploadEventPoster(
  posterFile: File,
  userId: string
): Promise<{ photoUrl: string; photoPath: string }> {
  if (!ALLOWED_POSTER_TYPES.has(posterFile.type)) {
    throw new Error("Poster must be a JPG, PNG, WEBP, or GIF file");
  }

  if (posterFile.size > MAX_POSTER_SIZE_BYTES) {
    throw new Error("Poster must be smaller than 5MB");
  }

  const extension = getPosterExtension(posterFile.type);
  const photoPath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabaseService()
    .storage
    .from(EVENT_POSTER_BUCKET)
    .upload(photoPath, posterFile, {
      contentType: posterFile.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabaseService()
    .storage
    .from(EVENT_POSTER_BUCKET)
    .getPublicUrl(photoPath);

  return {
    photoUrl: publicUrl,
    photoPath,
  };
}

// ── POST /api/events ──────────────────────────────────────────────────────────
// Creates a new event. Requires auth (Bearer token).
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser(request);

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid form data body" },
        { status: 400 }
      );
    }

    const title = formValue(formData, "title");
    const description = formValue(formData, "description");
    const location_name = formValue(formData, "location_name");
    const start_time = formValue(formData, "start_time");
    const end_time = formValue(formData, "end_time");
    const is_time_tbd = formValue(formData, "is_time_tbd");
    const lat = formValue(formData, "lat");
    const lng = formValue(formData, "lng");
    const meetup_location_name = formValue(formData, "meetup_location_name");
    const meetup_lat = formValue(formData, "meetup_lat");
    const meetup_lng = formValue(formData, "meetup_lng");
    const campus_affiliation = formValue(formData, "campus_affiliation");
    const keywords = formValue(formData, "keywords");
    const cost_text = formValue(formData, "cost_text");
    const spots = formValue(formData, "spots");
    const allow_waitlist = formValue(formData, "allow_waitlist");
    const poster = formData.get("poster");

    // ── Normalize basic fields ──────────────────────────────────────────────
    const titleText = typeof title === "string" ? title.trim() : "";

    const descriptionText =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;

    const locationNameText =
      typeof location_name === "string" ? location_name.trim() : "";

    const startTimeValue =
      typeof start_time === "string" && start_time.trim()
        ? start_time.trim()
        : null;

    const endTimeValue =
      typeof end_time === "string" && end_time.trim()
        ? end_time.trim()
        : null;

    const timeTbd = toBoolean(is_time_tbd);

    const meetupLocationNameText =
      typeof meetup_location_name === "string" && meetup_location_name.trim()
        ? meetup_location_name.trim()
        : null;

    const campusAffiliationArray = toStringArray(campus_affiliation);
    const keywordsArray = toStringArray(keywords);

    const meetupLatValue = toNumberOrNull(meetup_lat);
    const meetupLngValue = toNumberOrNull(meetup_lng);

    const latValue = toNumberOrDefault(lat, meetupLatValue ?? 0);
    const lngValue = toNumberOrDefault(lng, meetupLngValue ?? 0);

    const spotsValue = toPositiveIntegerOrNull(spots);
    const hasSpotsValue =
      spots !== undefined && spots !== null && spots !== "";

    // ── Validation ──────────────────────────────────────────────────────────
    if (!titleText) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 }
      );
    }

    if (!locationNameText) {
      return NextResponse.json(
        { ok: false, error: "location_name is required" },
        { status: 400 }
      );
    }

    if (!timeTbd && !startTimeValue) {
      return NextResponse.json(
        {
          ok: false,
          error: "start_time is required when is_time_tbd is false",
        },
        { status: 400 }
      );
    }

    if (hasSpotsValue && spotsValue === null) {
      return NextResponse.json(
        { ok: false, error: "spots must be a positive integer" },
        { status: 400 }
      );
    }

    // ── Upload poster if provided ───────────────────────────────────────────
    let photoUrl: string | null = null;
    let photoPath: string | null = null;

    if (poster instanceof File && poster.size > 0) {
      try {
        const uploadedPoster = await uploadEventPoster(poster, userId);

        photoUrl = uploadedPoster.photoUrl;
        photoPath = uploadedPoster.photoPath;
      } catch (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload event poster",
          },
          { status: 400 }
        );
      }
    }

    // ── Dedupe key ──────────────────────────────────────────────────────────
    const dedupeKey = computeDedupeKey(
      titleText,
      startTimeValue,
      timeTbd,
      locationNameText
    );

    // ── Insert ──────────────────────────────────────────────────────────────
    const { data, error } = await supabaseService()
      .from("events")
      .insert({
        title: titleText,
        description: descriptionText,
        location_name: locationNameText,

        start_time: timeTbd ? null : startTimeValue,
        end_time: endTimeValue,
        is_time_tbd: timeTbd,

        lat: latValue,
        lng: lngValue,

        meetup_location_name: meetupLocationNameText,
        meetup_lat: meetupLatValue,
        meetup_lng: meetupLngValue,

        campus_affiliation: campusAffiliationArray,
        keywords: keywordsArray,

        photo_url: photoUrl,
        photo_path: photoPath,

        cost_text:
          typeof cost_text === "string" && cost_text.trim()
            ? cost_text.trim()
            : null,

        spots: spotsValue,
        allow_waitlist: toBoolean(allow_waitlist),

        source: "user",
        external_id: null,
        dedupe_key: dedupeKey,
        created_by: userId,
      })
      .select("id, photo_url, photo_path")
      .single();

    if (error) {
      if (photoPath) {
        await supabaseService()
          .storage
          .from(EVENT_POSTER_BUCKET)
          .remove([photoPath]);
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "An identical event already exists (duplicate)" },
          { status: 409 }
        );
      }

      console.error("[POST /api/events]", error);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: data.id,
        photo_url: data.photo_url,
        photo_path: data.photo_path,
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

    console.error("[POST /api/events] unexpected", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}