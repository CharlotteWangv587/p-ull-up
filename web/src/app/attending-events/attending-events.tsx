"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { supabasePublic } from "@/lib/supabase";
import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(start: string, end?: string | null) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
}

export default function AttendingEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    (supabasePublic as any)
      .from("event_joins")
      .select(
        "events(id, title, location_name, start_time, end_time, event_saves(count), event_joins(count))"
      )
      .eq("user_id", user.id)
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setEvents(
            data
              .map((row) => row.events)
              .filter(Boolean)
              .map((e: any) => ({
                id: e.id,
                title: e.title,
                subTitle: e.location_name,
                tags: [],
                dateText: formatDate(e.start_time),
                timeText: formatTime(e.start_time, e.end_time),
                interestedCount: e.event_saves?.[0]?.count ?? 0,
                goingCount: e.event_joins?.[0]?.count ?? 0,
                ctaLabel: "View Event",
                href: `/events/${e.id}`,
              }))
          );
        }
        setLoading(false);
      });
  }, [user]);

  return (
    <EventCollectionPage
      title="Attending Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={loading ? [] : events}
      emptyMessage={
        loading
          ? "Loading…"
          : user
          ? "Events you're going to will appear here."
          : "Sign in to see events you're attending."
      }
      emptyActionLabel={user && !loading ? "Browse events" : undefined}
      emptyActionHref={user && !loading ? "/events" : undefined}
    />
  );
}
