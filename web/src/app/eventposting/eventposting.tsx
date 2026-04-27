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
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [tbdChecked, setTbdChecked] = useState(false);
  const [allowWaitlist, setAllowWaitlist] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [campusAffiliation, setCampusAffiliation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const dateText = tbdChecked
    ? 'Date/Time TBD'
    : eventDate
      ? new Date(eventDate).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : undefined;

  const timeText = tbdChecked
    ? undefined
    : eventTime
      ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })
      : undefined;

  const previewTags = [
    ...(campusAffiliation
      ? [{ id: `campus-${campusAffiliation}`, label: `#${campusAffiliation}`, accentColor: getCampusColor(normalizeTag(campusAffiliation)) }]
      : []),
    ...selectedTags.map((t) => ({ id: t, label: `#${t}`, accentColor: getCampusColor(t) })),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setError(null);

    if (!eventName.trim()) { setError('Event name is required.'); return; }
    if (!eventLocation.trim()) { setError('Location is required.'); return; }
    if (!tbdChecked && (!eventDate || !eventTime)) {
      setError('Please set a date and time, or check TBD.');
      return;
    }

    let startTime: string;
    if (tbdChecked) {
      // Placeholder: one year from now
      startTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      startTime = new Date(`${eventDate}T${eventTime}`).toISOString();
    }

    // Build a searchable description: user text + appended tags
    const allTags = [
      ...(campusAffiliation ? [campusAffiliation] : []),
      ...selectedTags,
    ];
    const tagSuffix = allTags.length > 0 ? `\n\n${allTags.map((t) => `#${t}`).join(' ')}` : '';
    const fullDescription = description.trim() + tagSuffix;

    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventName.trim(),
          description: fullDescription || null,
          start_time: startTime,
          location_name: eventLocation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create event.');
        return;
      }

      router.push(`/events/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return null;

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

            {/* Date + Time + TBD */}
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

            {/* Location of Event */}
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

            {/* Campus Affiliation */}
            <div className={styles.field}>
              <label className={styles.label}>Campus affiliation</label>
              <div className={styles.campusRow}>
                {CAMPUS_TAGS.map((campus) => {
                  const normalized = normalizeTag(campus);
                  return (
                    <TagButton
                      key={campus}
                      label={`#${campus}`}
                      selected={campusAffiliation === normalized}
                      onClick={() => setCampusAffiliation(campusAffiliation === normalized ? null : normalized)}
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
                value={selectedTags}
                onChange={setSelectedTags}
                name="keywords"
              />
            </div>

            {/* Location of Meetup */}
            <div className={styles.field}>
              <label className={styles.label}>Location of meetup</label>
              <div className={styles.inputWithIcon}>
                <input className={styles.input} type="text" placeholder="Where to meet up" />
                <span className={styles.inputIcon}>📍</span>
              </div>
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
                <input className={styles.input} type="text" placeholder="e.g. $10" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Spots <span className={styles.optionalTag}>(optional)</span>
                </label>
                <input className={styles.input} type="number" placeholder="e.g. 20" />
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

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'POSTING…' : 'POST EVENT'}
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
