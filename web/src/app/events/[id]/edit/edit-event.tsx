"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar/navbar";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import EventCard from "@/components/EventCard/event-card";
import TagInput from "@/components/TagInput/tag-input";
import styles from "@/app/eventposting/eventposting.module.css";
import editStyles from "./edit-event.module.css";

// ── Mock event data keyed by id ──────────────────────────────────────────────
type MockEvent = {
  name: string;
  date: string;
  time: string;
  location: string;
  meetup: string;
  description: string;
  tags: string[];
  cost: string;
  spots: string;
  waitlist: boolean;
};

const MOCK_EVENTS: Record<string, MockEvent> = {
  "10": {
    name: "p-ull up Kickback",
    date: "2025-05-02",
    time: "21:00",
    location: "Scripps Campus",
    meetup: "Front of Toll Hall",
    description: "Casual end-of-semester kickback. Good vibes, good music.",
    tags: ["party", "on campus"],
    cost: "Free",
    spots: "50",
    waitlist: true,
  },
  "11": {
    name: "Claremont Night Market",
    date: "2025-05-10",
    time: "17:00",
    location: "The Quad, CMC",
    meetup: "CMC Main Gate",
    description: "Local vendors, food trucks, and live performances.",
    tags: ["food", "outdoors", "on campus"],
    cost: "Free entry",
    spots: "200",
    waitlist: false,
  },
  "12": {
    name: "5C Study Abroad Info Night",
    date: "2025-04-30",
    time: "19:00",
    location: "Hahn, Pomona College",
    meetup: "Hahn Building Lobby",
    description: "Learn about study abroad programs across all 5 Claremont Colleges.",
    tags: ["on campus"],
    cost: "Free",
    spots: "80",
    waitlist: false,
  },
};

const DEFAULT_EVENT: MockEvent = {
  name: "",
  date: "",
  time: "",
  location: "",
  meetup: "",
  description: "",
  tags: [],
  cost: "",
  spots: "",
  waitlist: false,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditEventPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const seed = MOCK_EVENTS[id] ?? DEFAULT_EVENT;

  const [eventName, setEventName] = useState(seed.name);
  const [eventDate, setEventDate] = useState(seed.date);
  const [eventTime, setEventTime] = useState(seed.time);
  const [eventLocation, setEventLocation] = useState(seed.location);
  const [meetupLocation, setMeetupLocation] = useState(seed.meetup);
  const [description, setDescription] = useState(seed.description);
  const [selectedTags, setSelectedTags] = useState<string[]>(seed.tags);
  const [cost, setCost] = useState(seed.cost);
  const [spots, setSpots] = useState(seed.spots);
  const [allowWaitlist, setAllowWaitlist] = useState(seed.waitlist);
  const [tbdChecked, setTbdChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dateText = tbdChecked
    ? "Date/Time TBD"
    : eventDate
    ? new Date(eventDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : undefined;

  const timeText =
    tbdChecked || !eventTime
      ? undefined
      : new Date(`1970-01-01T${eventTime}`).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.page}>
      <Navbar
        showAuth={false}
        rightContent={
          <>
            <NotificationButton />
            <ProfileDropdown />
          </>
        }
      />

      <div className={styles.layout}>
        <div className={styles.card}>
          {/* Header */}
          <div className={editStyles.cardHeader}>
            <Link href="/created-events" className={editStyles.backLink}>
              ← Back to Created Events
            </Link>
            <h1 className={styles.heading}>Edit event</h1>
          </div>

          <form className={styles.form} onSubmit={handleSave}>

            <div className={styles.field}>
              <label className={styles.label}>Event name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Name your event"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                  className={styles.input}
                  type="date"
                  disabled={tbdChecked}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Time</label>
                <input
                  className={styles.input}
                  type="time"
                  disabled={tbdChecked}
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className={styles.field} style={{ flex: "0 0 auto" }}>
                <label className={styles.label}>&nbsp;</label>
                <div className={styles.tbdRow}>
                  <input
                    type="checkbox"
                    id="tbd"
                    checked={tbdChecked}
                    onChange={(e) => setTbdChecked(e.target.checked)}
                  />
                  <label htmlFor="tbd" className={styles.tbdLabel}>TBD</label>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Location of event</label>
              <input
                className={styles.input}
                type="text"
                placeholder="City, venue, or address"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tags</label>
              <TagInput
                value={selectedTags}
                onChange={setSelectedTags}
                name="tags"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Location of meetup</label>
              <div className={styles.inputWithIcon}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Where to meet up"
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                />
                <span className={styles.inputIcon}>📍</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Photo / Poster</label>
              <div className={styles.photoSection}>
                <div className={styles.photoButtons}>
                  <button type="button" className={styles.photoBtn}>Pick</button>
                  <button type="button" className={styles.photoBtn}>Generate</button>
                </div>
              </div>
            </div>

            <div className={styles.optionalRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Cost <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. $10"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Spots <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="e.g. 20"
                  value={spots}
                  onChange={(e) => setSpots(e.target.value)}
                />
              </div>
            </div>

            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={allowWaitlist}
                onChange={(e) => setAllowWaitlist(e.target.checked)}
              />
              Allow waitlist / drop-in check-in
            </label>

            {/* Save + status */}
            <button type="submit" className={styles.submitBtn}>
              {saved ? "SAVED ✓" : "SAVE CHANGES"}
            </button>

            {/* Delete section */}
            <div className={editStyles.dangerZone}>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  className={editStyles.deleteBtn}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete this event
                </button>
              ) : (
                <div className={editStyles.confirmDelete}>
                  <p>Are you sure? This can&apos;t be undone.</p>
                  <div className={editStyles.confirmRow}>
                    <Link href="/created-events" className={editStyles.confirmDeleteBtn}>
                      Yes, delete
                    </Link>
                    <button
                      type="button"
                      className={editStyles.cancelBtn}
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <aside className={styles.previewPane} aria-label="Event preview">
          <div className={styles.previewLabel}>Preview</div>
          <EventCard
            title={eventName || "Your event name"}
            subTitle={eventLocation || "City, venue, or address"}
            tags={selectedTags.map((t) => ({ id: t, label: `#${t}` }))}
            dateText={dateText}
            timeText={timeText}
            ctaLabel="View Event"
            onCtaClick={() => {}}
          />
        </aside>
      </div>
    </div>
  );
}
