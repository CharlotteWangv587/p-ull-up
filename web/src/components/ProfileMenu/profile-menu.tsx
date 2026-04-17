"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./profile-menu.module.css";

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

export default function ProfileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
            <Link href="/likedEvents" className={styles.dropdownLink} role="menuitem" onClick={() => setMenuOpen(false)}>
              Liked Events
            </Link>
            <Link href="/attendingEvents" className={styles.dropdownLink} role="menuitem" onClick={() => setMenuOpen(false)}>
              Attending Events
            </Link>
            <Link href="/" className={styles.dropdownLink} role="menuitem" onClick={() => setMenuOpen(false)}>
              Sign out
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
