"use client";

import { useState, useRef, useEffect} from "react";
import Link from "next/link";
import styles from "./appNavbar.module.css";

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NotificationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

type Props = {
  showSearch?: boolean;
};


export default function AppNavbar({showSearch = true}:Props) {

  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false); // 👈 close dropdown
      }
    }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={styles.navbar}>
      {/* LEFT: Logo + Search */}
      <div className={styles.navLeft}>
        <Link href="/personalized-dashboard" className={styles.logo}>
          p-ull up
        </Link>

        {showSearch && (
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchSection}>
                <input
                  type="text"
                  placeholder="Search events..."
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.divider}></div>
             <div className={styles.searchSection}>
               <input
                  type="text"
                  placeholder="City, State"
                  className={styles.searchInput}
               />
              </div>
              <button className={styles.searchIconBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Actions */}
      <div className={styles.navRight}>
        <button className={styles.iconActionBtn}>
          <NotificationIcon />
        </button>

        <div 
        className={styles.menuWrap} ref={menuRef}
        >
          <button
            className={styles.circleIcon}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <ProfileIcon />
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <Link href="/profile" className={styles.dropdownLink}>
                Edit profile
              </Link>
              <button>Liked Events</button>
              <button>Attending Events</button>
              <button>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}