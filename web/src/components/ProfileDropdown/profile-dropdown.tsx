"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./profile-dropdown.module.css";

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

type ProfileDropdownProps = {
  /** Called when the user clicks Sign out */
  onSignOut?: () => void;
  /** Called when any menu item is selected (for custom routing) */
  onCreatedEvents?: () => void;
  onLikedEvents?: () => void;
  onAttendingEvents?: () => void;
};

/**
 * Reusable profile menu button with dropdown.
 * Wire onSignOut / onCreatedEvents / onLikedEvents / onAttendingEvents to your
 * auth context and routing as needed.
 */
export default function ProfileDropdown({
  onSignOut,
  onCreatedEvents,
  onLikedEvents,
  onAttendingEvents,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className={styles.menuWrap}>
      <button
        type="button"
        className={styles.circleIcon}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        <UserIcon />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <Link
            href="/profile"
            className={styles.dropdownLink}
            role="menuitem"
            onClick={close}
          >
            Edit profile
          </Link>

          <button
            type="button"
            className={styles.dropdownBtn}
            role="menuitem"
            onClick={() => { close(); onCreatedEvents?.(); }}
          >
            Created Events
          </button>

          <button
            type="button"
            className={styles.dropdownBtn}
            role="menuitem"
            onClick={() => { close(); onLikedEvents?.(); }}
          >
            Liked Events
          </button>

          <button
            type="button"
            className={styles.dropdownBtn}
            role="menuitem"
            onClick={() => { close(); onAttendingEvents?.(); }}
          >
            Attending Events
          </button>

          <Link
            href="/"
            className={styles.dropdownLink}
            role="menuitem"
            onClick={() => { close(); onSignOut?.(); }}
          >
            Sign out
          </Link>
        </div>
      )}
    </div>
  );
}
