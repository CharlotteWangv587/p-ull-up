'use client';

import { useState } from 'react';
import styles from './eventposting.module.css';
import Navbar from '@/components/appNavbar/appNavbar';

export default function EventPosting() {
  const [tbdChecked, setTbdChecked] = useState(false);
  const [allowWaitlist, setAllowWaitlist] = useState(false);

  return (
    <>
    
    <Navbar showSearch={false}/>

    <div className={styles.page}>
      <div className={styles.card}>

        <h1 className={styles.heading}>Create An Event</h1>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

          {/* Event Name */}
          <div className={styles.field}>
            <label className={styles.label}>Event name</label>
            <input className={styles.input} type="text" placeholder="Name your event" />
          </div>

          {/* Date + Time + TBD */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                className={styles.input}
                type="date"
                disabled={tbdChecked}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time</label>
              <input
                className={styles.input}
                type="time"
                disabled={tbdChecked}
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
            <input className={styles.input} type="text" placeholder="City, venue, or address" />
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
            <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Description…" />
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

          <button type="submit" className={styles.submitBtn}>Post Event</button>

        </form>
      </div>
    </div>
    </>
  );
}
