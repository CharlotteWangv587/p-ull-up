"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "../../lib/supabase";
import styles from "../login/login.module.css";
import rpStyles from "./reset-password.module.css";

const LockIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 3 18 18" />
    <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.4 0 10 7 10 7a16.6 16.6 0 0 1-3.07 3.9" />
    <path d="M6.61 6.61A16.4 16.4 0 0 0 2 12s3.6 7 10 7a10.97 10.97 0 0 0 4.2-.8" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

function strengthLabel(pw: string): { label: string; level: number } {
  if (pw.length === 0) return { label: "", level: 0 };
  if (pw.length < 6) return { label: "Too short", level: 1 };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { label: "Weak", level: 1 };
  if (score === 2) return { label: "Fair", level: 2 };
  if (score === 3) return { label: "Good", level: 3 };
  return { label: "Strong", level: 4 };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = strengthLabel(password);
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    const { error } = await supabasePublic.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/personalized-dashboard"), 3000);
  }

  return (
    <div className={styles.wrapper}>
      {!done && (
        <Link href="/login" className={styles.backLink} aria-label="Back to login">
          ← Back to login
        </Link>
      )}

      <div className={styles.card}>
        {done ? (
          /* ── Success state ── */
          <div className={rpStyles.successState}>
            <span className={rpStyles.successIcon}>
              <CheckCircleIcon />
            </span>
            <h1 className={rpStyles.successTitle}>Password updated!</h1>
            <p className={rpStyles.successBody}>
              Your password has been changed. Redirecting you to your dashboard…
            </p>
            <Link href="/personalized-dashboard" className={rpStyles.dashLink}>
              Go to dashboard
            </Link>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Set new password</h1>
            <p className={rpStyles.subtitle}>
              Choose a strong password you haven&apos;t used before.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* New password */}
              <div className={rpStyles.pwField}>
                <div className={styles.inputGroup}>
                  <LockIcon />
                  <input
                    className={styles.input}
                    type={showPw ? "text" : "password"}
                    placeholder="New password"
                    autoComplete="new-password"
                    aria-label="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={rpStyles.eyeBtn}
                    onClick={() => setShowPw((p) => !p)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className={rpStyles.strengthRow}>
                    <div className={rpStyles.strengthBar}>
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          key={n}
                          className={rpStyles.strengthSegment}
                          data-active={n <= strength.level}
                          data-level={strength.level}
                        />
                      ))}
                    </div>
                    <span className={rpStyles.strengthLabel}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className={styles.inputGroup}>
                <LockIcon />
                <input
                  className={`${styles.input} ${mismatch ? rpStyles.inputError : ""}`}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  aria-label="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={rpStyles.eyeBtn}
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {mismatch && (
                <p className={rpStyles.mismatchMsg} role="alert">Passwords don&apos;t match</p>
              )}

              {error && <p className={rpStyles.errorMsg} role="alert">{error}</p>}

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={!canSubmit}
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
