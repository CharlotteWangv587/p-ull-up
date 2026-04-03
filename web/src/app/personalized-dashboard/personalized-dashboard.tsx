 "use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../dashboard/dashboard.module.css";
import Navbar from "@/components/Navbar/navbar";

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
  const mockEvents = [
    { id: 1, title: "Coachella Carpool", location: "Indio, CA" },
    { id: 2, title: "LA Philharmonic Group", location: "Walt Disney Hall" },
    { id: 3, title: "Beach Clean-up Crew", location: "Santa Monica" },
    { id: 4, title: "Techstars Mixer", location: "DTLA" },
  ];

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
          Don&apos;t miss out just because you lack a group. Match with nearby event-goers, organize committed attendance,
          and coordinate safe carpooling.
        </p>
      </header>

      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2>Events near you...</h2>
          <Link href="/events" className={styles.seeMore}>See more events... →</Link>
        </div>

        <div className={styles.eventGrid}>
          {mockEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventImagePlaceholder}>Event Image</div>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              <button className={styles.viewGroupBtn}>View Group</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.postCta}>
        <h3>Have an event in mind?</h3>
        <button className={styles.postBtn}>Post your own event...</button>
      </section>
    </div>
  );
}
