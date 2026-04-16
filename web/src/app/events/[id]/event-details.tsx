"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar/navbar";
import TagButton from "@/components/TagButton/tag-button";
import RsvpButton from "@/components/RsvpButton/rsvp-button";
import styles from "./event-details.module.css";

export type EventDetailsData = {
  id: string;
  title: string;
  posterUrl?: string | null;
  location: string;
  time: string;
  price?: string | null;
  tags: readonly string[];
  details: string;
  interestedCount?: number;
  goingCount?: number;
};

type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export default function EventDetails({ event }: { event: EventDetailsData }) {
  const [rsvp, setRsvp] = useState<"interested" | "going" | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(() => [
    {
      id: "c1",
      author: "Someone",
      body: "This looks fun — who’s carpooling?",
      createdAt: "Just now",
    },
  ]);

  const counts = useMemo(() => {
    const interested = (event.interestedCount ?? 0) + (rsvp === "interested" ? 1 : 0);
    const going = (event.goingCount ?? 0) + (rsvp === "going" ? 1 : 0);
    return { interested, going };
  }, [event.goingCount, event.interestedCount, rsvp]);

  function submitComment() {
    const body = commentText.trim();
    if (!body) return;
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        author: "You",
        body,
        createdAt: "Now",
      },
      ...prev,
    ]);
    setCommentText("");
  }

  const priceLabel = event.price ? event.price : "Free";

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.wrap}>
        <div className={styles.split}>
          <div className={styles.leftCol}>
            {/* 1. TITLE AND META INFO */}
            <header>
              <h1 className={styles.title}>{event.title}</h1>
              <p className={styles.metaLine}>
                <strong>{event.location}</strong>
                {" · "}
                {event.time}
                {" · "}
                {priceLabel}
              </p>
            </header>

            {/* 2. TAGS */}
            <section className={styles.block} aria-label="Tags">
              <h2 className={styles.blockLabel}>Tags</h2>
              <div className={styles.tagsRow}>
                {event.tags.map((t) => (
                  <TagButton key={t} label={`#${t}`} size="sm" disabled />
                ))}
              </div>
            </section>

            {/* 3. ABOUT THIS EVENT */}
            <section className={styles.block} aria-label="About">
              <h2 className={styles.blockLabel}>About this event</h2>
              <p className={styles.detailsText}>{event.details}</p>
            </section>

            {/* 4. INTERESTED/GOING BUTTONS (RSVP label removed) */}
            <section className={styles.block} aria-label="RSVP">
              <div className={styles.rsvpRow}>
                <RsvpButton
                  kind="interested"
                  active={rsvp === "interested"}
                  count={counts.interested}
                  onClick={() => setRsvp((cur) => (cur === "interested" ? null : "interested"))}
                />
                <RsvpButton
                  kind="going"
                  active={rsvp === "going"}
                  count={counts.going}
                  onClick={() => setRsvp((cur) => (cur === "going" ? null : "going"))}
                />
              </div>
            </section>

            {/* 5. COMMENTS */}
            <section className={styles.block} id="comments" aria-label="Comments">
              <h2 className={styles.blockLabel}>Comments</h2>

              <div className={styles.commentForm}>
                <textarea
                  className={styles.commentInput}
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="button" className={styles.sendBtn} onClick={submitComment}>
                  Send
                </button>
              </div>

              <div className={styles.commentList}>
                {comments.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentMeta}>
                      {c.author} · {c.createdAt}
                    </div>
                    <div className={styles.commentBody}>{c.body}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.rightCol} aria-label="Event poster">
            <div className={styles.posterShell}>
              <div className={styles.poster}>
                {event.posterUrl ? (
                  <img src={event.posterUrl} alt={`${event.title} poster`} />
                ) : (
                  <span>Poster</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );

}
