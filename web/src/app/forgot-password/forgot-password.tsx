"use client";

import Link from "next/link";
import { useState } from "react";
import { supabasePublic } from "../../lib/supabase";
import styles from "../login/login.module.css";
import fpStyles from "./forgot-password.module.css";

const EnvelopeIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MailSentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="m16 16 2 2 4-4" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className={styles.wrapper}>
      <Link href="/login" className={styles.backLink} aria-label="Back to login">
        ← Back to login
      </Link>

      <div className={styles.card}>
        {sent ? (
          /* ── Success state ── */
          <div className={fpStyles.successState}>
            <span className={fpStyles.successIcon}>
              <MailSentIcon />
            </span>
            <h1 className={fpStyles.successTitle}>Check your email</h1>
            <p className={fpStyles.successBody}>
              We sent a password reset link to{" "}
              <strong>{email}</strong>. It may take a minute to arrive — check your spam folder if
              you don&apos;t see it.
            </p>
            <Link href="/login" className={fpStyles.backToLogin}>
              Back to login
            </Link>
            <button
              type="button"
              className={fpStyles.resendBtn}
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Try a different email
            </button>
          </div>
        ) : (
          /* ── Request form ── */
          <>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={fpStyles.subtitle}>
              Enter the email address on your account and we&apos;ll send you a reset link.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <EnvelopeIcon />
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className={fpStyles.errorMsg} role="alert">{error}</p>}

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className={styles.footer}>
              Remember it?{" "}
              <Link href="/login" className={styles.createLink}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
