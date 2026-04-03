"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";
import Navbar from '@/components/Navbar/navbar';

export default function PublicDashboardPage() {
  /** * MOCK DATA: These represent real events that will eventually 
   * come from your Supabase database.
   */
  const mockEvents = [
    { id: 1, title: "Coachella Carpool", location: "Indio, CA" },
    { id: 2, title: "LA Philharmonic Group", location: "Walt Disney Hall" },
    { id: 3, title: "Beach Clean-up Crew", location: "Santa Monica" },
    { id: 4, title: "Techstars Mixer", location: "DTLA" },
  ];

  return (
    <div className={styles.container}>
      {/* 1. NAVIGATION BAR 
          Layout: Logo + Search (Left) | Login + Sign Up (Right)
      */}
      <Navbar />

      {/* 2. HERO SECTION 
          Matches the 'Wavy' design and Title/Tagline from your sketch.
      */}
      <header className={styles.hero}>
        <h1>Find your group. Attend the event.</h1>
        <p className={styles.tagline}>p-ull up: Social Coordination for Off-Campus Events</p>
        <p className={styles.description}>
          Don't miss out just because you lack a group. Match with nearby event-goers, 
          organize committed attendance, and coordinate safe carpooling.
        </p>
      </header>

      {/* 3. EVENTS GRID 
          Displays the 4-column grid from your sketch.
      */}
      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2>Events near you...</h2>
          <Link href="/events" className={styles.seeMore}>See more events... →</Link>
        </div>
        
        <div className={styles.eventGrid}>
          {/* We 'map' over the mockEvents array to create a card for each item */}
          {mockEvents.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventImagePlaceholder}>Event Image</div>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              {/* The styled action button for joining a group */}
              <button className={styles.viewGroupBtn}>View Group</button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. POST CALL-TO-ACTION 
          The bottom section for users to start their own coordination.
      */}
      <section className={styles.postCta}>
        <h3>Have an event in mind?</h3>
        <Link href="/eventposting">
          <button className={styles.postBtn}>Post your own event...</button>
        </Link>
      </section>
    </div>
  );
}