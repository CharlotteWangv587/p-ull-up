"use client";

import Link from "next/link";
import styles from "../dashboard/dashboard.module.css";
import Navbar from "@/components/Navbar/navbar";
import ProfileMenu from "@/components/ProfileMenu/profile-menu";
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

export default function PersonalizedDashboardPage() {
  return (
    <div className={styles.container}>
      <Navbar showAuth={false} rightContent={<ProfileMenu />} />

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
