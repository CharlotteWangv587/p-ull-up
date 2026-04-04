"use client";

import Link from "next/link";
import styles from "../dashboard/dashboard.module.css";
import AppNavbar from "@/components/appNavbar/appNavbar";

export default function PersonalizedDashboardPage() {
  const mockEvents = [
    { id: 1, title: "Coachella Carpool", location: "Indio, CA" },
    { id: 2, title: "LA Philharmonic Group", location: "Walt Disney Hall" },
    { id: 3, title: "Beach Clean-up Crew", location: "Santa Monica" },
    { id: 4, title: "Techstars Mixer", location: "DTLA" },
  ];

  return (
    <div className={styles.container}>
      <AppNavbar showSearch={true} />

      <header className={styles.hero}>
        <h1>Find your group. Attend the event.</h1>
        <p className={styles.tagline}>
          p-ull up: Social Coordination for Off-Campus Events
        </p>
        <p className={styles.description}>
          Don&apos;t miss out just because you lack a group. Match with nearby event-goers,
          organize committed attendance, and coordinate safe carpooling.
        </p>
      </header>

      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2>Events near you...</h2>
          <Link href="/events" className={styles.seeMore}>
            See more events... →
          </Link>
        </div>

        <div className={styles.eventGrid}>
          {mockEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventImagePlaceholder}>Event Image</div>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              <button className={styles.viewGroupBtn}>
                View Group
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.postCta}>
        <h3>Have an event in mind?</h3>
        <Link href="/eventposting">
        <button className={styles.postBtn}>
          Post your own event...
        </button>
        </Link>
      </section>
    </div>
  );
}