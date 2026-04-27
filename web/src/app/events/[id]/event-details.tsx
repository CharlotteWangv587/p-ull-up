"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/navbar";
import TagButton from "@/components/TagButton/tag-button";
import RsvpButton from "@/components/RsvpButton/rsvp-button";
import CommentSection from "@/components/Comment/comment-section";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import { useAuth } from "@/context/auth";
import { supabasePublic } from "@/lib/supabase";
import styles from "./event-details.module.css";
import type { CommentData } from "@/components/Comment/comment";

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

export default function EventDetails({ event }: { event: EventDetailsData }) {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const [joined, setJoined] = useState(false);
  const [saveCount, setSaveCount] = useState(event.interestedCount ?? 0);
  const [joinCount, setJoinCount] = useState(event.goingCount ?? 0);

  // null = not yet loaded; [] = loaded but empty
  const [comments, setComments] = useState<CommentData[] | null>(null);

  // Load comments once (public endpoint, no auth needed)
  useEffect(() => {
    fetch(`/api/events/${event.id}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.ok ? data.comments : []))
      .catch(() => setComments([]));
  }, [event.id]);

  // Check the current user's save/join status after auth resolves
  useEffect(() => {
    if (authLoading || !user) return;

    Promise.all([
      supabasePublic
        .from("event_saves")
        .select("user_id")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabasePublic
        .from("event_joins")
        .select("user_id")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([saveRes, joinRes]) => {
      setSaved(saveRes.data !== null);
      setJoined(joinRes.data !== null);
    });
  }, [authLoading, user, event.id]);

  async function toggleSave() {
    if (!user || !session) {
      router.push("/login");
      return;
    }
    const willSave = !saved;
    setSaved(willSave);
    setSaveCount((c) => c + (willSave ? 1 : -1));

    const res = await fetch(`/api/events/${event.id}/save`, {
      method: willSave ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setSaved(!willSave);
      setSaveCount((c) => c + (willSave ? -1 : 1));
    }
  }

  async function toggleJoin() {
    if (!user || !session) {
      router.push("/login");
      return;
    }
    const willJoin = !joined;
    setJoined(willJoin);
    setJoinCount((c) => c + (willJoin ? 1 : -1));

    const res = await fetch(`/api/events/${event.id}/join`, {
      method: willJoin ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setJoined(!willJoin);
      setJoinCount((c) => c + (willJoin ? -1 : 1));
    }
  }

  async function handlePostComment(_eventId: string, body: string) {
    if (!session) throw new Error("Not logged in");
    const res = await fetch(`/api/events/${event.id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    // CommentSection handles the optimistic add internally
  }

  async function handleDeleteComment(commentId: string) {
    if (!session) throw new Error("Not logged in");
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) throw new Error("Failed to delete comment");
  }

  const priceLabel = event.price ?? "Free";
  const isLoggedIn = !authLoading && !!user;

  return (
    <div className={styles.page}>
      <Navbar
        showAuth={false}
        rightContent={
          isLoggedIn ? (
            <>
              <NotificationButton />
              <ProfileDropdown onSignOut={signOut} />
            </>
          ) : undefined
        }
      />

      <main className={styles.wrap}>
        <div className={styles.split}>
          <div className={styles.leftCol}>
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

            <section className={styles.block} aria-label="About">
              <h2 className={styles.blockLabel}>About this event</h2>
              <p className={styles.detailsText}>{event.details || "No description provided."}</p>
            </section>

            <section className={styles.block} aria-label="RSVP">
              <div className={styles.rsvpRow}>
                <RsvpButton
                  kind="interested"
                  active={saved}
                  count={saveCount}
                  onClick={toggleSave}
                />
                <RsvpButton
                  kind="going"
                  active={joined}
                  count={joinCount}
                  onClick={toggleJoin}
                />
              </div>
              {!authLoading && !user && (
                <p className={styles.loginHint}>
                  <a href="/login">Log in</a> to save or RSVP to this event.
                </p>
              )}
            </section>

            <section className={styles.block} id="comments" aria-label="Comments">
              <h2 className={styles.blockLabel}>Comments</h2>
              {isLoggedIn && comments !== null ? (
                <CommentSection
                  eventId={event.id}
                  initialComments={comments}
                  currentUserId={user.id}
                  eventCreatorId={event.creatorId}
                  onPost={handlePostComment}
                  onDelete={handleDeleteComment}
                />
              ) : isLoggedIn ? (
                <p className={styles.loginHint}>Loading comments…</p>
              ) : !authLoading ? (
                <p className={styles.loginHint}>
                  <a href="/login">Log in</a> to view and post comments.
                </p>
              ) : null}
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
