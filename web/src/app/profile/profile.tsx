"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./profile.module.css";
import Navbar from "@/components/Navbar/navbar";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import AnimatedPageBackground from "@/components/AnimatedPageBackground/animated-page-background";

type ProfileValues = {
  name: string;
  email: string;
  location: string;
  instagram: string;
  password: string;
};

const DEFAULT_VALUES: ProfileValues = {
  name: "Vika Prokopenko",
  email: "vika@example.com",
  location: "Claremont, CA",
  instagram: "@pullupcommunity",
  password: "",
};

const DRAFT_KEY = "pullup-profile-draft";
const PREFS_KEY = "pullup-notif-prefs";

type NotifPrefs = {
  commentReplies: boolean;
  myEventLiked: boolean;
  myEventGoing: boolean;
  likedEventComment: boolean;
  attendingEventComment: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  commentReplies: true,
  myEventLiked: true,
  myEventGoing: true,
  likedEventComment: false,
  attendingEventComment: false,
};

const NOTIF_SETTINGS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  {
    key: "commentReplies",
    label: "Replies to my comments",
    description: "Get notified when someone responds to a comment you left on an event.",
  },
  {
    key: "myEventLiked",
    label: "Likes on my events",
    description: "Get notified when someone likes an event you created.",
  },
  {
    key: "myEventGoing",
    label: "RSVPs on my events",
    description: "Get notified when someone marks themselves as going to an event you created.",
  },
  {
    key: "likedEventComment",
    label: "Comments on events I liked",
    description: "Get notified when a new comment is posted on an event you've liked.",
  },
  {
    key: "attendingEventComment",
    label: "Comments on events I'm attending",
    description: "Get notified when a new comment is posted on an event you're attending.",
  },
];

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const rawDraft = localStorage.getItem(DRAFT_KEY);
    if (!rawDraft) return;
    try {
      const parsed = JSON.parse(rawDraft) as Partial<ProfileValues>;
      setValues((prev) => ({ ...prev, ...parsed }));
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
      setNotifPrefs((prev) => ({ ...prev, ...parsed }));
    } catch {
      localStorage.removeItem(PREFS_KEY);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [values]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  const togglePref = useCallback((key: keyof NotifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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
    <AnimatedPageBackground>
    <div className={styles.page}>
      <Navbar
        showAuth={false}
        logoHref="/personalized-dashboard"
        rightContent={
          <>
            <NotificationButton />
            <ProfileDropdown />
          </>
        }
      />

      <main className={styles.main}>
        <section className={styles.card} id="personal-info">
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

        {/* ── Notification Settings ── */}
        <section className={styles.card} id="notification-settings">
          <p className={styles.sectionLabel}>Notification Settings</p>
          <p className={styles.sectionHint}>
            Choose what you&apos;d like to be notified about. Changes save automatically.
          </p>

          <ul className={styles.notifList}>
            {NOTIF_SETTINGS.map(({ key, label, description }) => (
              <li key={key} className={styles.notifRow}>
                <div className={styles.notifText}>
                  <span className={styles.notifLabel}>{label}</span>
                  <span className={styles.notifDesc}>{description}</span>
                </div>
                <label className={styles.toggle} aria-label={label}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={notifPrefs[key]}
                    onChange={() => togglePref(key)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
    </AnimatedPageBackground>
  );
}

