import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import EventDetails from "./event-details";

function formatTime(start: string, end?: string | null): string {
  const dateStr = new Date(start).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: event } = await (supabasePublic as any)
    .from("events")
    .select(
      "id, title, description, start_time, end_time, location_name, created_by, event_saves(count), event_joins(count)"
    )
    .eq("id", id)
    .single();

  if (!event) notFound();

  return (
    <EventDetails
      event={{
        id: event.id,
        title: event.title,
        posterUrl: null,
        location: event.location_name,
        time: formatTime(event.start_time, event.end_time),
        tags: [],
        details: event.description ?? "",
        interestedCount: event.event_saves?.[0]?.count ?? 0,
        goingCount: event.event_joins?.[0]?.count ?? 0,
        creatorId: event.created_by ?? undefined,
      }}
    />
  );
}
