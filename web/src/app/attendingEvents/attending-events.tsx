"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/navbar";
import ProfileMenu from "@/components/ProfileMenu/profile-menu";
import EventCard from "@/components/EventCard/event-card";
import styles from "./attending-events.module.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real Supabase query (user's "going" RSVPs)
// sorted ascending by date so the soonest event appears first
// ---------------------------------------------------------------------------
const attendingEvents = [
  {
    id: 1,
    title: "Afrofusion",
    subTitle: "Dom's Lounge",
    tags: ["party", "on campus", "pomona", "afrobeats"],
    dateText: "Sat, Apr 11",
    timeText: "11:00 PM–1:00 AM",
    interestedCount: 47,
    goingCount: 77,
    date: new Date("2026-04-11T23:00:00"),
    href: "/events/1",
  },
  {
    id: 5,
    title: "5C Culture Night",
    subTitle: "Pomona College, Big Bridges",
    tags: ["on campus", "food", "cultural"],
    dateText: "Fri, Apr 18",
    timeText: "7:00 PM–10:00 PM",
    interestedCount: 88,
    goingCount: 55,
    date: new Date("2026-04-18T19:00:00"),
    href: "/events/5",
  },
].sort((a, b) => a.date.getTime() - b.date.getTime());

export default function AttendingEventsPage() {
  return (
    <div className={styles.page}>
      <Navbar showAuth={false} rightContent={<ProfileMenu />} />

      <main className={styles.wrap}>
        <h1 className={styles.heading}>
          I&apos;m going to&hellip;
        </h1>
        <p className={styles.subHeading}>
          Events you&apos;ve committed to attending, sorted by date.
        </p>

        <div className={styles.divider} />

        {attendingEvents.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📅</span>
            <p className={styles.emptyTitle}>No plans yet</p>
            <p className={styles.emptyText}>
              Tap &ldquo;I&apos;m going&rdquo; on an event to add it to your schedule.
            </p>
            <Link href="/events" className={styles.emptyLink}>
              Browse events
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.sortBar}>
              <span className={styles.count}>
                {attendingEvents.length} event{attendingEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className={styles.grid}>
              {attendingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  subTitle={event.subTitle}
                  tags={event.tags.map((t) => ({
                    id: `attending-${event.id}-${t}`,
                    label: `#${t}`,
                  }))}
                  dateText={event.dateText}
                  timeText={event.timeText}
                  interestedCount={event.interestedCount}
                  goingCount={event.goingCount}
                  ctaLabel="View Event"
                  href={event.href}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
