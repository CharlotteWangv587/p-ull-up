'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './eventposting.module.css';
import Navbar from '@/components/Navbar/navbar';
import NotificationButton from '@/components/NotificationButton/notification-button';
import ProfileDropdown from '@/components/ProfileDropdown/profile-dropdown';
import EventCard from '@/components/EventCard/event-card';
import TagInput from '@/components/TagInput/tag-input';
import TagButton from '@/components/TagButton/tag-button';
import AnimatedPageBackground from '@/components/AnimatedPageBackground/animated-page-background';
import { CAMPUS_TAGS, getCampusColor } from '@/lib/campus';
import { normalizeTag } from '@/components/TagInput/tag-input';
import { useAuth } from '@/context/auth';

export default function EventPosting() {

  // ── Form state ────────────────────────────────────────────────────────────
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [tbdChecked, setTbdChecked]         = useState(false);
  const [allowWaitlist, setAllowWaitlist]   = useState(false);
  const [eventName, setEventName]           = useState('');
  const [eventDate, setEventDate]           = useState('');
  const [eventTime, setEventTime]           = useState('');
  const [eventEndTime, setEventEndTime]     = useState('');
  const [eventLocation, setEventLocation]   = useState('');
  const [description, setDescription] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [costText, setCostText]             = useState('');
  const [spots, setSpots]                   = useState('');
  const [keywords, setKeywords]             = useState<string[]>([]);
  // Multi-select campus affiliations (PDF spec: campus_affiliation text[])
  const [campusAffiliations, setCampusAffiliations] = useState<string[]>([]);

  // ── Submit state ──────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);


  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // ── Campus toggle (multi-select) ──────────────────────────────────────────
  function toggleCampus(campus: string) {
    const normalized = normalizeTag(campus);
    setCampusAffiliations((prev) =>
      prev.includes(normalized)
        ? prev.filter((c) => c !== normalized)
        : [...prev, normalized]
    );
  }

  // ── Preview helpers ───────────────────────────────────────────────────────
  const dateText = tbdChecked
    ? 'Date/Time TBD'
    : eventDate
      ? new Date(eventDate).toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
        })
      : undefined;

  const timeText = tbdChecked
    ? undefined
    : eventTime
      ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString(undefined, {
          hour: 'numeric', minute: '2-digit',
        })
      : undefined;

  const previewTags = [
    ...campusAffiliations.map((c) => ({
      id: `campus-${c}`,
      label: `#${c}`,
      accentColor: getCampusColor(c),
    })),
    ...keywords.map((t) => ({ id: t, label: `#${t}`, accentColor: getCampusColor(t) })),
  ];

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user || !session) {
      setError('You must be signed in to post an event.');
      return;
    }
    if (!eventName.trim()) { setError('Event name is required.'); return; }
    if (!eventLocation.trim()) { setError('Location is required.'); return; }
    if (!tbdChecked && !eventDate) { setError('Date is required (or check TBD).'); return; }
    if (!tbdChecked && !eventTime) { setError('Start time is required (or check TBD).'); return; }

    const startTime = tbdChecked
      ? null
      : new Date(`${eventDate}T${eventTime}`).toISOString();

    const endTime =
      !tbdChecked && eventDate && eventEndTime
        ? new Date(`${eventDate}T${eventEndTime}`).toISOString()
        : null;

    // campus_affiliation stores values like ["Pomona", "CMC"] — capitalise first letter
    const campusArray = campusAffiliations.map(
      (c) => c.charAt(0).toUpperCase() + c.slice(1)
    );

    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title:                eventName.trim(),
          description:          description.trim() || null,
          location_name:        eventLocation.trim(),
          start_time:           startTime,
          end_time:             endTime,
          is_time_tbd:          tbdChecked,
          meetup_location_name: meetupLocation.trim() || null,
          campus_affiliation:   campusArray,
          keywords,
          cost_text:            costText.trim() || null,
          spots:                spots ? parseInt(spots, 10) : null,
          allow_waitlist:       allowWaitlist,
        }),
      });

      const json = await res.json();

      if (res.status === 409) {
        setError('An identical event already exists. Please check and try again.');
        return;
      }
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push(`/events/${json.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatedPageBackground>
    <div className={styles.page}>
      <Navbar
        showAuth={false}
        logoHref="/personalized-dashboard"
        rightContent={
          <>
            <NotificationButton />
            <ProfileDropdown onSignOut={signOut} />
          </>
        }
      />
      <div className={styles.layout}>
        <div className={styles.card}>

          <h1 className={styles.heading}>Create event</h1>

          <form className={styles.form} onSubmit={handleSubmit}>

            {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

            {/* Event Name */}
            <div className={styles.field}>
              <label className={styles.label}>Event name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Name your event"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            {/* Date + Start Time + End Time + TBD */}
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
                <label className={styles.label}>Start time</label>
                <input
                  className={styles.input}
                  type="time"
                  disabled={tbdChecked}
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  End time <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="time"
                  disabled={tbdChecked}
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                />
              </div>
              <div className={styles.field} style={{ flex: '0 0 auto' }}>
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

            {/* Event Location */}
            <div className={styles.field}>
              <label className={styles.label}>Location of event</label>
              <input
                className={styles.input}
                type="text"
                placeholder="City, venue, or address"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
                
              />
            </div>

            {/* Meetup Location */}
            <div className={styles.field}>
              <label className={styles.label}>
                Location of meetup <span className={styles.optionalTag}>(optional)</span>
              </label>
              <div className={styles.inputWithIcon}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Where to meet up before the event"
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                />
                <span className={styles.inputIcon}>📍</span>
              </div>
            </div>

            {/* Campus Affiliation (multi-select) */}
            <div className={styles.field}>
              <label className={styles.label}>Campus affiliation</label>
              <div className={styles.campusRow}>
                {CAMPUS_TAGS.map((campus) => {
                  const normalized = normalizeTag(campus);
                  return (
                    <TagButton
                      key={campus}
                      label={`#${campus}`}
                      selected={campusAffiliations.includes(normalized)}
                      onClick={() => toggleCampus(campus)}
                      accentColor={getCampusColor(normalized)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Keywords */}
            <div className={styles.field}>
              <label className={styles.label}>Keywords</label>
              <TagInput
                value={keywords}
                onChange={setKeywords}
                name="keywords"
              />
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo / Poster */}
            <div className={styles.field}>
              <label className={styles.label}>Photo / Poster</label>
              <div className={styles.photoSection}>
                <div className={styles.photoButtons}>
                  <button type="button" className={styles.photoBtn}>Pick</button>
                  <button type="button" className={styles.photoBtn}>Generate</button>
                </div>
              </div>
            </div>

            {/* Cost + Spots */}
            <div className={styles.optionalRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Cost <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. $10, Free, $5 suggested"
                  value={costText}
                  onChange={(e) => setCostText(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Spots <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  placeholder="e.g. 20"
                  value={spots}
                  onChange={(e) => setSpots(e.target.value)}
                />
              </div>
            </div>

            {/* Allow waitlist */}
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={allowWaitlist}
                onChange={(e) => setAllowWaitlist(e.target.checked)}
              />
              Allow waitlist / drop-in check-in
            </label>

            {/* Error message */}
            {error && (
              <p style={{ color: 'var(--error, #e53e3e)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {error}
              </p>
            )}

            {!user && (
              <p style={{ color: 'var(--muted, #888)', fontSize: '0.875rem' }}>
                You must be signed in to post an event.
              </p>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !user}
            >
              {submitting ? 'Posting…' : 'POST EVENT'}
            </button>

          </form>
        </div>

        <aside className={styles.previewPane} aria-label="Event preview">
          <div className={styles.previewLabel}>Preview</div>
          <EventCard
            title={eventName || 'Your event name'}
            subTitle={eventLocation || 'City, venue, or address'}
            tags={previewTags}
            dateText={dateText}
            timeText={timeText}
            ctaLabel="View Event"
            onCtaClick={() => {}}
          />
        </aside>
      </div>
    </div>
    </AnimatedPageBackground>
  );
}
