import Link from 'next/link';
import styles from './navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>

      {/* LEFT GROUP: Logo and Search Bar tied together */}
      <div className={styles.navLeft}>
        <div className={styles.logo}>p-ull up</div>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchSection}>
              <input type="text" placeholder="Search events..." className={styles.searchInput} />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.searchSection}>
              <input type="text" placeholder="City, State" className={styles.searchInput} />
            </div>
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
        <Link href="/login" className={styles.navLink}>Login</Link>
        <Link href="/signUp">
          <button className={styles.signUpBtn}>Create Account</button>
        </Link>
      </div>

    </nav>
  );
}