"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./profile.module.css";

type ProfileValues = {
  name: string;
  email: string;
  location: string;
  instagram: string;
  password: string;
};

const DEFAULT_VALUES: ProfileValues = {
  name: "Franklyn Forson",
  email: "franklyn@example.com",
  location: "Charlotte, NC",
  instagram: "@pullupcommunity",
  password: "",
};

const DRAFT_KEY = "pullup-profile-draft";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <path d="m8 16 4 4 4-4" />
      <path d="M12 12v8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4.8 8-12a8 8 0 1 0-16 0c0 7.2 8 12 8 12Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 19" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 3 18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.4 0 10 7 10 7a16.6 16.6 0 0 1-3.07 3.9" />
      <path d="M6.61 6.61A16.4 16.4 0 0 0 2 12s3.6 7 10 7a10.97 10.97 0 0 0 4.2-.8" />
    </svg>
  );
}

export default function ProfilePage() {
  const [values, setValues] = useState<ProfileValues>(DEFAULT_VALUES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const rawDraft = localStorage.getItem(DRAFT_KEY);
    if (!rawDraft) return;
    try {
      const parsed = JSON.parse(rawDraft) as Partial<ProfileValues>;
      setValues((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [values]);

  const formReady = useMemo(() => {
    return values.name.trim().length > 1 && values.email.includes("@");
  }, [values.email, values.name]);

  const onFieldChange = (field: keyof ProfileValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || isSaving) return;
    setIsSaving(true);
    setStatus("");
    window.setTimeout(() => {
      setIsSaving(false);
      setStatus("Profile updated successfully.");
      setValues((prev) => ({ ...prev, password: "" }));
      setCurrentPassword("");
      setShowPasswordPrompt(false);
    }, 900);
  };

  const onChooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    const nextUrl = URL.createObjectURL(file);
    setAvatarPreview(nextUrl);
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const requestPasswordChange = () => {
    if (!showPasswordPrompt) {
      setShowPasswordPrompt(true);
    }
  };

  const canSavePassword = currentPassword.trim().length >= 6;

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo} aria-label="Back to home">
            p-ull up
          </Link>
          <div className={styles.searchWrapper}>
            <input className={styles.searchInput} placeholder="Search events, groups..." aria-label="Search" />
            <button type="button" className={styles.searchButton} aria-label="Search">
              <SearchIcon />
            </button>
          </div>
        </div>
        <div className={styles.navActions}>
          <button type="button" className={styles.circleIcon} aria-label="Cloud sync">
            <CloudIcon />
          </button>
          <div className={styles.menuWrap}>
            <button
              type="button"
              className={styles.circleIcon}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
            >
              <UserIcon />
            </button>
            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <button type="button" role="menuitem">Edit profile</button>
                <button type="button" role="menuitem">My friends</button>
                <button type="button" role="menuitem">Account settings</button>
                <button type="button" role="menuitem">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <p className={styles.sectionLabel}>Personal Information</p>
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.profileRow}>
              <div className={styles.avatarSection}>
                <button type="button" className={styles.avatarButton} onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className={styles.avatarImage} /> : <UserIcon />}
                </button>
                <button type="button" className={styles.linkButton} onClick={() => fileInputRef.current?.click()}>
                  Change photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={onChooseAvatar}
                  aria-label="Upload profile image"
                />
              </div>

              <div className={styles.fields}>
                <label className={styles.inputGroup}>
                  <span>Name</span>
                  <input value={values.name} onChange={onFieldChange("name")} autoComplete="name" />
                </label>
                <label className={styles.inputGroup}>
                  <span>Email</span>
                  <input type="email" value={values.email} onChange={onFieldChange("email")} autoComplete="email" />
                </label>
                <label className={styles.inputGroup}>
                  <span>Password</span>
                  <div className={styles.passwordGroup}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onFocus={requestPasswordChange}
                      onChange={onFieldChange("password")}
                      placeholder="Enter a new password"
                      autoComplete="new-password"
                    />
                    <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((prev) => !prev)} aria-label="Toggle password visibility">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </label>
              </div>
            </div>

            {showPasswordPrompt && (
              <div className={styles.passwordPrompt}>
                <p>For security, confirm your current password before setting a new one.</p>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </div>
            )}

            <div className={styles.metaInputs}>
              <label className={styles.metaInput}>
                <PinIcon />
                <input value={values.location} onChange={onFieldChange("location")} placeholder="Charlotte, NC" aria-label="Location" />
              </label>
              <label className={styles.metaInput}>
                <LinkIcon />
                <input value={values.instagram} onChange={onFieldChange("instagram")} placeholder="@yourinstagram" aria-label="Instagram link" />
              </label>
            </div>

            <div className={styles.formFooter}>
              {status ? <p className={styles.status}>{status}</p> : <p className={styles.statusHint}>Draft autosaves while you type.</p>}
              <button type="submit" className={styles.saveButton} disabled={!formReady || (showPasswordPrompt && !canSavePassword) || isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

