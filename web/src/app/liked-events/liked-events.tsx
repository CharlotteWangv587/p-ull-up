"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { supabasePublic } from "@/lib/supabase";
import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";

const LIKED_EVENTS: CollectionEvent[] = [
  {
    id: "2",
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: [
      { id: "2-music", label: "#music" },
      { id: "2-food", label: "#food" },
      { id: "2-outdoors", label: "#outdoors" },
      { id: "2-concert", label: "#concert" },
    ],
    dateText: "Sat, Apr 11",
    timeText: "3:00 PM–10:00 PM",
    interestedCount: 269,
    goingCount: 113,
    ctaLabel: "View Event",
    href: "/events/2",
  },
  {
    id: "4",
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: [
      { id: "4-networking", label: "#networking" },
      { id: "4-startup", label: "#startup" },
    ],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 31,
    goingCount: 18,
    ctaLabel: "View Event",
    href: "/events/4",
  },
];

function formatEventDate(startTime?: string | null, endTime?: string | null) {
  // Simple formatting; adjust locale/options to your needs.
  if (!startTime) {
    return { dateText: "", timeText: "" };
  }
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;

  const optionsDate: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

  const dateText = start.toLocaleDateString(undefined, optionsDate);
  const timeText = end
    ? `${start.toLocaleTimeString(undefined, optionsTime)}–${end.toLocaleTimeString(undefined, optionsTime)}`
    : start.toLocaleTimeString(undefined, optionsTime);

  return { dateText, timeText };
}

export default function LikedEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      setLoading(true);
      try {
        if (!user) {
          // no signed-in user -> no liked events
          setEvents([]);
          return;
        }

        // Fetch saved event IDs for the current user
        const { data: savedRows, error: savedError } = await supabasePublic
          .from("event_saves")
          .select("event_id")
          .eq("user_id", user.id);

        if (savedError) {
          console.error(savedError);
          setEvents([]);
          return;
        }

        const ids = (savedRows ?? []).map((r: any) => r.event_id);
        if (ids.length === 0) {
          setEvents([]);
          return;
        }

        // Fetch event details for the saved IDs
        const { data: eventsData, error: eventsError } = await supabasePublic
          .from("events")
          .select("id, title, location_name, start_time, end_time, event_saves(count), event_joins(count)")
          .in("id", ids);

        if (eventsError) {
          console.error(eventsError);
          setEvents([]);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEvents((eventsData ?? []).map((e: any) => {
          const { dateText, timeText } = formatEventDate(e.start_time, e.end_time);
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
          } as CollectionEvent;
        }));
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    load().catch(console.error);
  }, [user, authLoading, router]);

  if (authLoading || loading) return null;

  return (
    <EventCollectionPage
      title="Liked Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={loading ? [] : events}
      emptyMessage={
        loading
          ? "Loading…"
          : user
          ? "Events you like will appear here. Start exploring!"
          : "Sign in to see your liked events."
      }
      emptyActionLabel={user && !loading ? "Browse events" : undefined}
      emptyActionHref={user && !loading ? "/events" : undefined}
    />
  );
}
