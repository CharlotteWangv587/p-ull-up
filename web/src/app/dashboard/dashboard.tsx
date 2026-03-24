import React from 'react';
import Link from 'next/link'; // REQUIRED: This allows buttons to 'jump' to other pages without refreshing
import styles from './dashboard.module.css';

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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
      <nav className={styles.navbar}>
        
        {/* LEFT GROUP: Logo and Search Bar tied together */}
        <div className={styles.navLeft}>
          <Link href="/profile" className={styles.profileIconLink} aria-label="Go to profile page">
            <ProfileIcon />
          </Link>
          <div className={styles.logo}>p-ull up</div>
          
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              {/* Keyword Search Section */}
              <div className={styles.searchSection}>
                <input type="text" placeholder="Search events..." className={styles.searchInput} />
              </div>
              
              <div className={styles.divider}></div>
              
              {/* Location Search Section */}
              <div className={styles.searchSection}>
                <input type="text" placeholder="City, State" className={styles.searchInput} />
              </div>
              
              {/* Search Icon Button with SVG Graphic */}
              <button className={styles.searchIconBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT GROUP: Auth Links */}
        <div className={styles.navRight}>
          {/* Navigates to the login page your teammate built */}
          <Link href="/login" className={styles.navLink}>Login</Link>
          
          <Link href="/signUp">
            <button className={styles.signUpBtn}>Create Account</button>
          </Link>
        </div>
      </nav>

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
        <button className={styles.postBtn}>Post your own event...</button>
      </section>
    </div>
  );
}