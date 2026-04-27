"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar/navbar";
import TagButton from "@/components/TagButton/tag-button";
import RsvpButton from "@/components/RsvpButton/rsvp-button";
import CommentSection from "@/components/Comment/comment-section";
import styles from "./event-details.module.css";
import { supabasePublic } from "@/lib/supabase";
import { useAuth } from "@/context/auth";

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
  creatorId?: string;
};

type EventDetailsProps = {
  event: EventDetailsData;
  isAdmin?: boolean;
};

export default function EventDetails({ event, isAdmin }: EventDetailsProps) {
  const { user, session } = useAuth();

  const [rsvp, setRsvp] = useState<"interested" | "going" | null>(null);
  const [counts, setCounts] = useState({
    interested: event.interestedCount ?? 0,
    going: event.goingCount ?? 0,
  });
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Load this user's current RSVP status for the event
  useEffect(() => {
    if (!user) { setRsvp(null); return; }
    async function loadStatus() {
      const [{ data: save }, { data: join }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabasePublic as any).from("event_saves").select("user_id").eq("event_id", event.id).maybeSingle(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabasePublic as any).from("event_joins").select("user_id").eq("event_id", event.id).maybeSingle(),
      ]);
      if (join) setRsvp("going");
      else if (save) setRsvp("interested");
      else setRsvp(null);
    }
    loadStatus();
  }, [user, event.id]);

  async function handleRsvp(kind: "interested" | "going") {
    if (!user || rsvpLoading) return;

    const newRsvp = rsvp === kind ? null : kind;
    const prevRsvp = rsvp;
    const prevCounts = counts;

    // Optimistic update — apply immediately so UI feels instant
    setRsvp(newRsvp);
    setCounts({
      interested:
        counts.interested +
        (newRsvp === "interested" ? 1 : prevRsvp === "interested" ? -1 : 0),
      going:
        counts.going +
        (newRsvp === "going" ? 1 : prevRsvp === "going" ? -1 : 0),
    });

    setRsvpLoading(true);
    try {
      // Remove previous status first
      if (prevRsvp === "interested") {
        await (supabasePublic as any)
          .from("event_saves")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);
      } else if (prevRsvp === "going") {
        await (supabasePublic as any)
          .from("event_joins")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);
      }

      // Write new status
      if (newRsvp === "interested") {
        await (supabasePublic as any)
          .from("event_saves")
          .insert({ user_id: user.id, event_id: event.id });
      } else if (newRsvp === "going") {
        await (supabasePublic as any)
          .from("event_joins")
          .insert({ user_id: user.id, event_id: event.id });
      }
    } catch {
      // Rollback on error
      setRsvp(prevRsvp);
      setCounts(prevCounts);
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const token = session?.access_token;
    if (!token) return;
    await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.wrap}>
        <div className={styles.split}>
          <div className={styles.leftCol}>
            {/* TITLE + META */}
            <header>
              <h1 className={styles.title}>{event.title}</h1>
              <p className={styles.metaLine}>
                <strong>{event.location}</strong>
                {" · "}
                {event.time}
                {" · "}
                {event.price ?? "Free"}
              </p>
            </header>

            {/* TAGS */}
            {event.tags.length > 0 && (
              <section className={styles.block} aria-label="Tags">
                <h2 className={styles.blockLabel}>Tags</h2>
                <div className={styles.tagsRow}>
                  {event.tags.map((t) => (
                    <TagButton key={t} label={`#${t}`} size="sm" disabled />
                  ))}
                </div>
              </section>
            )}

            {/* ABOUT */}
            <section className={styles.block} aria-label="About">
              <h2 className={styles.blockLabel}>About this event</h2>
              <p className={styles.detailsText}>{event.details}</p>
            </section>

            {/* RSVP */}
            <section className={styles.block} aria-label="RSVP">
              <div className={styles.rsvpRow}>
                <RsvpButton
                  kind="interested"
                  active={rsvp === "interested"}
                  count={counts.interested}
                  onClick={() => handleRsvp("interested")}
                />
                <RsvpButton
                  kind="going"
                  active={rsvp === "going"}
                  count={counts.going}
                  onClick={() => handleRsvp("going")}
                />
              </div>
              {!user && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted, #888)", marginTop: "0.5rem" }}>
                  <Link href="/login" style={{ color: "inherit", textDecoration: "underline" }}>
                    Sign in
                  </Link>{" "}
                  to RSVP
                </p>
              )}
            </section>

            {/* COMMENTS */}
            <section className={styles.block} id="comments" aria-label="Comments">
              <h2 className={styles.blockLabel}>Comments</h2>
              <CommentSection
                eventId={event.id}
                currentUserId={user?.id}
                eventCreatorId={event.creatorId}
                isAdmin={isAdmin}
                onDelete={user ? handleDeleteComment : undefined}
              />
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
