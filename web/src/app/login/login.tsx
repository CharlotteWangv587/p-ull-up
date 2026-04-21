"use client";

import Link from "next/link";
import styles from "./login.module.css";
import { useState } from "react";
import { supabasePublic } from "../../lib/supabase";

const EnvelopeIcon = () => (
  <svg
    className={styles.inputIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg
    className={styles.inputIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function mapAuthError(message: string, status?: number) {
    const lower = (message || "").toLowerCase();

    if (status === 429 || lower.includes("rate limit exceeded")) {
      return "Too many email requests. Please wait a bit and try again.";
    }

    if (
      lower.includes("invalid login credentials") ||
      lower.includes("invalid credentials") ||
      lower.includes("email not found") ||
      lower.includes("invalid email or password")
    ) {
      return "Incorrect email or password.";
    }

    if (
      lower.includes("email not confirmed") ||
      lower.includes("confirm your email")
    ) {
      return "Please confirm your email before signing in.";
    }

    if (lower.includes("user already registered")) {
      return "An account with this email already exists.";
    }

    return message || "Unable to continue right now. Please try again.";
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setError(mapAuthError(error.message, (error as { status?: number }).status));
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Sign-in did not create a session.");
      setLoading(false);
      return;
    }

    window.location.assign("/personalized-dashboard");
  }

  async function handleGoogleSignIn() {
    if (loading) return;

    setError("");
    setLoading(true);

    const { error } = await supabasePublic.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(mapAuthError(error.message, (error as { status?: number }).status));
      setLoading(false);
    }
  }

  return (
    <BackgroundGradientAnimation
      containerClassName="min-h-screen"
      className="flex flex-col items-center justify-center px-6 py-10 min-h-screen"
    >
      <Link href="/" className={styles.backLink} aria-label="Back to home">
        ← Back to home
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back!</h1>
        <p className={styles.subtitle}>Sign in to continue to your dashboard.</p>

        <form className={styles.form} onSubmit={handleLogin}>
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

          <div className={styles.inputGroup}>
            <LockIcon />
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Sign in
          </button>

          <button
            type="button"
            className={styles.btnGoogle}
            aria-label="Sign in with Google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>

        <p className={styles.footer}>
          First time?{" "}
          <Link href="/sign-up" className={styles.createLink}>
            Create Account
          </Link>
        </p>
      </div>
    </BackgroundGradientAnimation>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}