import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import EventDetails from "./event-details";

function formatTime(start: string | null, isTimeTbd: boolean, end?: string | null) {
  if (isTimeTbd || !start) return "Date / Time TBD";
  const date = new Date(start);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return end ? `${dateStr} • ${fmt(start)}–${fmt(end)}` : `${dateStr} • ${fmt(start)}`;
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event } = await (supabasePublic as any)
    .from("events")
    .select(
      `id, title, photo_url, location_name,
       start_time, end_time, is_time_tbd,
       cost_text, description, created_by,
       campus_affiliation, keywords,
       meetup_location_name, spots, allow_waitlist,
       event_saves(count), event_joins(count)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  // Merge campus affiliations and keywords into the tags array for display
  const tags: string[] = [
    ...((event.campus_affiliation as string[]) ?? []),
    ...((event.keywords as string[]) ?? []),
  ];

  return (
    <EventDetails
      event={{
        id:             event.id,
        title:          event.title,
        posterUrl:      event.photo_url ?? null,
        location:       event.location_name,
        time:           formatTime(event.start_time, event.is_time_tbd ?? false, event.end_time),
        price:          event.cost_text ?? null,
        tags,
        details:        event.description ?? "",
        interestedCount: event.event_saves?.[0]?.count ?? 0,
        goingCount:      event.event_joins?.[0]?.count ?? 0,
        creatorId:      event.created_by ?? undefined,
      }}
    />
  );
}
