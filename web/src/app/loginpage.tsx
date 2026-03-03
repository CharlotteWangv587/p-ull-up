"use client";

/**
 * Login / sign-up UI. Lives at app root (not inside login/) so it can be
 * shared or reused; the /login route is wired in login/page.tsx via re-export.
 * Styles are in login.module.css (CSS Modules for scoped class names).
 */
import Link from "next/link";
import styles from "./login.module.css";

/** Inline SVG icons for form fields—no icon library dependency. Reuse styles.inputIcon for position/color. */
const PersonIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg> )


const EnvelopeIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      {/* Client-side nav back to home; keeps /login and / in sync */}
      <Link href="/" className={styles.backLink} aria-label="Back to home">
        ← Back to home
      </Link>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        {/* preventDefault so we can wire real auth later without full-page submit */}
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <PersonIcon />
            <input className={styles.input} type="text" placeholder="Name" autoComplete="name" aria-label="Name" />
          </div>
          <div className={styles.inputGroup}>
            <EnvelopeIcon />
            <input className={styles.input} type="email" placeholder="E-mail" autoComplete="email" aria-label="E-mail" />
          </div>
          <div className={styles.inputGroup}>
            <LockIcon />
            <input className={styles.input} type="password" placeholder="Password" autoComplete="new-password" aria-label="Password" />
          </div>
          <div className={styles.buttons}>
            <button type="submit" className={styles.btnPrimary}>
              SIGN UP
            </button>
            <button type="button" className={styles.btnSecondary}>
              SIGN IN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
