"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";
import Navbar from "@/components/Navbar/navbar";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import EventCard from "@/components/EventCard/event-card";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { supabasePublic } from "@/lib/supabase";

type EventRow = {
  id: string;
  title: string;
  location_name: string;
  start_time: string;
  end_time: string | null;
  event_saves: { count: number }[];
  event_joins: { count: number }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(start: string, end?: string | null) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  return end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
}

export default function PersonalizedDashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    supabasePublic
      .from("events")
      .select(
        "id, title, location_name, start_time, end_time, event_saves(count), event_joins(count)"
      )
      .order("start_time", { ascending: true })
      .limit(8)
      .then(({ data }) => {
        if (data) setEvents(data as EventRow[]);
      });
  }, []);

  async function handleSignOut() {
    await supabasePublic.auth.signOut();
    router.push("/");
  }

  return (
    <div className={styles.container}>
      <Navbar
        showAuth={false}
        logoHref="/personalized-dashboard"
        rightContent={
          <>
            <NotificationButton />
            <ProfileDropdown onSignOut={handleSignOut} />
          </>
        }
      />

      <div className={styles.heroWrap}>
        <BackgroundGradientAnimation containerClassName="w-full">
          <AnimatedHero />
        </BackgroundGradientAnimation>
      </div>

      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2>Events near you...</h2>
          <Link href="/events" className={styles.seeMore}>
            See more events... →
          </Link>
        </div>

        <div className={styles.eventGrid}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              subTitle={event.location_name}
              dateText={formatDate(event.start_time)}
              timeText={formatTime(event.start_time, event.end_time)}
              interestedCount={event.event_saves[0]?.count ?? 0}
              goingCount={event.event_joins[0]?.count ?? 0}
              ctaLabel="View Event"
              href={`/events/${event.id}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.postCta}>
        <h3>Have an event in mind?</h3>
        <Link href="/eventposting">
          <button className={styles.postBtn}>Post your own event...</button>
        </Link>
      </section>
    </div>
  );
}
