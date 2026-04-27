"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { supabasePublic } from "@/lib/supabase";
import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";
import styles from "@/components/EventCollectionPage/event-collection-page.module.css";

function formatDate(start: string, end?: string | null) {
  const dateText = new Date(start).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeText = end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
  return { dateText, timeText };
}

export default function CreatedEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabasePublic as any)
      .from("events")
      .select("id, title, location_name, start_time, end_time, event_saves(count), event_joins(count)")
      .eq("created_by", user.id)
      .order("start_time", { ascending: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEvents((data ?? []).map((e: any) => {
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
      })
      .catch(console.error);
  }, [user, authLoading, router]);

  if (authLoading || loading) return null;

  return (
    <EventCollectionPage
      title="Created Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={events}
      showEditButton
      emptyMessage="You haven't created any events yet."
      emptyActionLabel="Post your first event"
      emptyActionHref="/eventposting"
      headerAction={
        <Link href="/eventposting" className={styles.postBtn}>
          + Post New Event
        </Link>
      }
    />
  );
}
