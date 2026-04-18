"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import styles from "./navbar.module.css";

type SearchCategory = "keyword" | "event" | "campus";

const SEARCH_CATEGORIES: { value: SearchCategory; label: string; placeholder: string }[] = [
  { value: "keyword", label: "Keyword", placeholder: "Search events, tags, and more…" },
  { value: "event",   label: "Event",   placeholder: "Search by event name…"          },
  { value: "campus",  label: "Campus",  placeholder: "e.g. Pomona, CMC…"              },
];

type NavbarProps = {
  showAuth?: boolean;
  rightContent?: ReactNode;
};

export default function Navbar({ showAuth = true, rightContent }: NavbarProps) {
  const [category, setCategory] = useState<SearchCategory>("keyword");

  const active = SEARCH_CATEGORIES.find((c) => c.value === category)!;

  return (
    <nav className={styles.navbar}>

      {/* LEFT GROUP: Logo + Search */}
      <div className={styles.navLeft}>
        <Link href="/" className={styles.logo} aria-label="Go to home page">
          p-ull up
        </Link>

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            {/* Category selector */}
            <select
              className={styles.searchCategory}
              value={category}
              onChange={(e) => setCategory(e.target.value as SearchCategory)}
              aria-label="Search category"
            >
              {SEARCH_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className={styles.divider} />

            <div className={styles.searchSection}>
              <input
                type="text"
                placeholder={active.placeholder}
                className={styles.searchInput}
                aria-label={`Search by ${active.label}`}
              />
            </div>

            <button className={styles.searchIconBtn} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT GROUP */}
      {showAuth ? (
        <div className={styles.navRight}>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/signUp">
            <button className={styles.signUpBtn}>Create Account</button>
          </Link>
        </div>
      ) : (
        <div className={styles.navRight}>{rightContent}</div>
      )}

    </nav>
  );
}
