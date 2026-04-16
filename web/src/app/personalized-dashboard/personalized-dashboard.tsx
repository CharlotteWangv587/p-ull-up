"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../dashboard/dashboard.module.css";
import Navbar from "@/components/Navbar/navbar";
import EventCard from "@/components/EventCard/event-card";

const mockEvents = [
  {
    id: 1,
    title: "Afrofusion",
    subTitle: "Dom's Lounge",
    tags: ["party", "on campus", "pomona", "afrobeats"],
    dateText: "Sat, Apr 11",
    timeText: "11:00 PM–1:00 AM",
    interestedCount: 47,
    goingCount: 76,
    href: "/events/1",
  },
  {
    id: 2,
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: ["music", "food", "outdoors", "vendors", "concert"],
    dateText: "Sat, Apr 11",
    timeText: "3:00 PM–10:00 PM",
    interestedCount: 269,
    goingCount: 113,
    href: "/events/2",
  },
  {
    id: 3,
    title: "Beginner Daze 5C Surf Club x POCO",
    subTitle: "Santa Monica",
    tags: ["surfing", "outdoors", "off campus"],
    dateText: "Sun, Apr 19",
    timeText: "9:00 AM–4:00 PM",
    interestedCount: 25,
    goingCount: 14,
    href: "/events/3",
  },
  {
    id: 4,
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: ["networking", "startup"],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 31,
    goingCount: 18,
    href: "/events/4",
  },
];

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NotificationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

export default function PersonalizedDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Navbar
        showAuth={false}
        rightContent={
          <>
            <button type="button" className={styles.iconActionBtn} aria-label="View notifications">
              <NotificationIcon />
            </button>

            <div className={styles.menuWrap}>
              <button
                type="button"
                className={styles.circleIcon}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
              >
                <ProfileIcon />
              </button>
              {menuOpen && (
                <div className={styles.dropdown} role="menu">
                  <Link href="/profile" className={styles.dropdownLink} role="menuitem" onClick={() => setMenuOpen(false)}>
                    Edit profile
                  </Link>
                  <button type="button" role="menuitem">Liked Events</button>
                  <button type="button" role="menuitem">Attending Events</button>
                  <Link href="/" className={styles.dropdownLink} role="menuitem" onClick={() => setMenuOpen(false)}>
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          </>
        }
      />

      <header className={styles.hero}>
        <h1>Find your group. Attend the event.</h1>
        <p className={styles.tagline}>p-ull up: Social Coordination for Off-Campus Events</p>
        <p className={styles.description}>
          Don&apos;t miss out just because you lack a group. Match with nearby event-goers,
          organize committed attendance, and coordinate safe carpooling.
        </p>
      </header>

      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2>Events near you...</h2>
          <Link href="/events" className={styles.seeMore}>See more events... →</Link>
        </div>

        <div className={styles.eventGrid}>
          {mockEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              subTitle={event.subTitle}
              tags={event.tags.map((t) => ({ id: `${event.id}-${t}`, label: `#${t}` }))}
              dateText={event.dateText}
              timeText={event.timeText}
              interestedCount={event.interestedCount}
              goingCount={event.goingCount}
              ctaLabel="View Event"
              href={event.href}
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
