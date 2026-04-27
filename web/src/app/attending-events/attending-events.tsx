"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { supabasePublic } from "@/lib/supabase";
import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";

function formatDate(start: string, end?: string | null) {
  const dateText = new Date(start).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeText = end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
  return { dateText, timeText };
}

export default function AttendingEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }

    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: joins } = await (supabasePublic as any)
        .from("event_joins")
        .select("event_id")
        .eq("user_id", user!.id);

      const ids = (joins ?? []).map((j: { event_id: string }) => j.event_id);
      if (ids.length === 0) { setLoading(false); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: eventsData } = await (supabasePublic as any)
        .from("events")
        .select("id, title, location_name, start_time, end_time, event_saves(count), event_joins(count)")
        .in("id", ids);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEvents((eventsData ?? []).map((e: any) => {
        const { dateText, timeText } = formatDate(e.start_time, e.end_time);
        return {
          id: e.id,
          title: e.title,
          subTitle: e.location_name,
          tags: [],
          dateText,
          timeText,
          interestedCount: e.event_saves?.[0]?.count ?? 0,
          goingCount: e.event_joins?.[0]?.count ?? 0,
          ctaLabel: "View Event",
          href: `/events/${e.id}`,
        } satisfies CollectionEvent;
      }));
      setLoading(false);
    }

    load().catch(console.error);
  }, [user, authLoading, router]);

  if (authLoading || loading) return null;

  return (
    <EventCollectionPage
      title="Attending Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={events}
      emptyMessage="Events you're going to will appear here."
      emptyActionLabel="Browse events"
      emptyActionHref="/events"
    />
  );
}
