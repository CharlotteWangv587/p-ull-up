"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/navbar";
import ProfileMenu from "@/components/ProfileMenu/profile-menu";
import EventCard from "@/components/EventCard/event-card";
import styles from "./liked-events.module.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real Supabase query (user's "interested" RSVPs)
// sorted ascending by date so the soonest event appears first
// ---------------------------------------------------------------------------
const likedEvents = [
  {
    id: 2,
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: ["music", "food", "outdoors", "vendors", "concert"],
    dateText: "Sat, Apr 11",
    timeText: "3:00 PM–10:00 PM",
    interestedCount: 270,
    goingCount: 113,
    date: new Date("2026-04-11T15:00:00"),
    href: "/events/2",
  },
  {
    id: 3,
    title: "Beginner Daze 5C Surf Club x POCO",
    subTitle: "Santa Monica",
    tags: ["surfing", "outdoors", "off campus"],
    dateText: "Sun, Apr 19",
    timeText: "9:00 AM–4:00 PM",
    interestedCount: 26,
    goingCount: 14,
    date: new Date("2026-04-19T09:00:00"),
    href: "/events/3",
  },
  {
    id: 4,
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: ["networking", "startup"],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 32,
    goingCount: 18,
    date: new Date("2026-04-24T18:00:00"),
    href: "/events/4",
  },
].sort((a, b) => a.date.getTime() - b.date.getTime());

export default function LikedEventsPage() {
  return (
    <div className={styles.page}>
      <Navbar showAuth={false} rightContent={<ProfileMenu />} />

      <main className={styles.wrap}>
        <h1 className={styles.heading}>
          I&apos;m interested in&hellip;
        </h1>
        <p className={styles.subHeading}>
          Events you&apos;ve marked as interesting, sorted by date.
        </p>

        <div className={styles.divider} />

        {likedEvents.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🤍</span>
            <p className={styles.emptyTitle}>Nothing here yet</p>
            <p className={styles.emptyText}>
              Tap &ldquo;I&apos;m interested&rdquo; on any event to save it here.
            </p>
            <Link href="/events" className={styles.emptyLink}>
              Browse events
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.sortBar}>
              <span className={styles.count}>
                {likedEvents.length} event{likedEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className={styles.grid}>
              {likedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  subTitle={event.subTitle}
                  tags={event.tags.map((t) => ({
                    id: `liked-${event.id}-${t}`,
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
