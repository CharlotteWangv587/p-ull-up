'use client';

import { useEffect, useRef, useState } from 'react';
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

const ALLOWED_POSTER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024;

// Keep uploaded posters and all previews in the same stable EventCard-friendly shape.
const POSTER_CROP_WIDTH = 1200;
const POSTER_CROP_HEIGHT = 675;
const CROPPED_POSTER_MIME_TYPE = 'image/jpeg';
const CROPPED_POSTER_QUALITY = 0.9;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image file.'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not crop this poster.'));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

function getCroppedPosterName(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '').trim() || 'event-poster';
  return `${baseName}-cropped.jpg`;
}

async function cropPosterToEventRatio(file: File): Promise<File> {
  const image = await loadImageFromFile(file);
  const targetRatio = POSTER_CROP_WIDTH / POSTER_CROP_HEIGHT;
  const sourceRatio = image.naturalWidth / image.naturalHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = POSTER_CROP_WIDTH;
  canvas.height = POSTER_CROP_HEIGHT;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not process this poster.');
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    POSTER_CROP_WIDTH,
    POSTER_CROP_HEIGHT
  );

  const blob = await canvasToBlob(
    canvas,
    CROPPED_POSTER_MIME_TYPE,
    CROPPED_POSTER_QUALITY
  );

  return new File([blob], getCroppedPosterName(file.name), {
    type: CROPPED_POSTER_MIME_TYPE,
    lastModified: Date.now(),
  });
}

export default function EventPosting() {
  // ── Form state ────────────────────────────────────────────────────────────
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [tbdChecked, setTbdChecked] = useState(false);
  const [allowWaitlist, setAllowWaitlist] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [costText, setCostText] = useState('');
  const [spots, setSpots] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Multi-select campus affiliations (PDF spec: campus_affiliation text[])
  const [campusAffiliations, setCampusAffiliations] = useState<string[]>([]);

  // Event poster upload state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement | null>(null);

  // ── Submit state ──────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Clean up browser-created preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (posterPreviewUrl) {
        URL.revokeObjectURL(posterPreviewUrl);
      }
    };
  }, [posterPreviewUrl]);

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
    ...campusAffiliations.map((c) => ({
      id: `campus-${c}`,
      label: `#${c}`,
      accentColor: getCampusColor(c),
    })),
    ...keywords.map((t) => ({
      id: t,
      label: `#${t}`,
      accentColor: getCampusColor(t),
    })),
  ];

  // ── Poster upload ─────────────────────────────────────────────────────────
  function handlePickPosterClick() {
    posterInputRef.current?.click();
  }

  async function handlePosterPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_POSTER_TYPES.includes(file.type)) {
      setError('Poster must be a JPG, PNG, WEBP, or GIF file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_POSTER_SIZE_BYTES) {
      setError('Poster must be smaller than 5MB.');
      e.target.value = '';
      return;
    }

    try {
      const croppedPoster = await cropPosterToEventRatio(file);
      const nextPreviewUrl = URL.createObjectURL(croppedPoster);

      if (posterPreviewUrl) {
        URL.revokeObjectURL(posterPreviewUrl);
      }

      setPosterFile(croppedPoster);
      setPosterPreviewUrl(nextPreviewUrl);
      setError(null);
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : 'Could not crop this poster. Please try another image.'
      );
      e.target.value = '';
    }
  }

  function removePoster() {
    if (posterPreviewUrl) {
      URL.revokeObjectURL(posterPreviewUrl);
    }

    setPosterFile(null);
    setPosterPreviewUrl(null);

    if (posterInputRef.current) {
      posterInputRef.current.value = '';
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user || !session) {
      setError('You must be signed in to post an event.');
      return;
    }

    if (!eventName.trim()) {
      setError('Event name is required.');
      return;
    }

    if (!eventLocation.trim()) {
      setError('Location is required.');
      return;
    }

    if (!tbdChecked && !eventDate) {
      setError('Date is required, or check TBD.');
      return;
    }

    if (!tbdChecked && !eventTime) {
      setError('Start time is required, or check TBD.');
      return;
    }

    const startTime = tbdChecked
      ? null
      : new Date(`${eventDate}T${eventTime}`).toISOString();

    const endTime =
      !tbdChecked && eventDate && eventEndTime
        ? new Date(`${eventDate}T${eventEndTime}`).toISOString()
        : null;

    // campus_affiliation stores values like ["Pomona", "CMC"]
    const campusArray = campusAffiliations.map(
      (c) => c.charAt(0).toUpperCase() + c.slice(1)
    );

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', eventName.trim());
      formData.append('location_name', eventLocation.trim());
      formData.append('is_time_tbd', String(tbdChecked));
      formData.append('campus_affiliation', JSON.stringify(campusArray));
      formData.append('keywords', JSON.stringify(keywords));
      formData.append('allow_waitlist', String(allowWaitlist));

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (startTime) {
        formData.append('start_time', startTime);
      }

      if (endTime) {
        formData.append('end_time', endTime);
      }

      if (meetupLocation.trim()) {
        formData.append('meetup_location_name', meetupLocation.trim());
      }

      if (costText.trim()) {
        formData.append('cost_text', costText.trim());
      }

      if (spots) {
        formData.append('spots', spots);
      }

      if (posterFile) {
        formData.append('poster', posterFile);
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
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
              {error && (
                <p
                  style={{
                    color: 'var(--error, #e53e3e)',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}

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
                    <label htmlFor="tbd" className={styles.tbdLabel}>
                      TBD
                    </label>
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
                <TagInput value={keywords} onChange={setKeywords} name="keywords" />
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
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePosterPick}
                    style={{ display: 'none' }}
                  />

                 {posterPreviewUrl ? (
                    <div className={styles.posterPreviewWrap}>
                      <div className={styles.posterPreviewFrame}>
                        <img
                          src={posterPreviewUrl}
                          alt="Selected event poster preview"
                          className={styles.posterPreview}
                        />
                      </div>

                      <div className={styles.photoButtons}>
                        <button
                          type="button"
                          className={styles.photoBtn}
                          onClick={handlePickPosterClick}
                        >
                          Change
                        </button>

                        <button
                          type="button"
                          className={styles.photoBtn}
                          onClick={removePoster}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.photoButtons}>
                      <button
                        type="button"
                        className={styles.photoBtn}
                        onClick={handlePickPosterClick}
                      >
                        Pick
                      </button>

                      <button
                        type="button"
                        className={styles.photoBtn}
                        disabled
                        title="Generate is not wired yet"
                      >
                        Generate
                      </button>
                    </div>
                  )}
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
              imageUrl={posterPreviewUrl ?? undefined}
              ctaLabel="View Event"
              onCtaClick={() => {}}
            />
          </aside>
        </div>
      </div>
    </AnimatedPageBackground>
  );
}
