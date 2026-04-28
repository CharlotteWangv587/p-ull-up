"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

  const [saveCount, setSaveCount] = useState(
    Math.max(0, event.interestedCount ?? 0)
  );
  const [joinCount, setJoinCount] = useState(
    Math.max(0, event.goingCount ?? 0)
  );

  const [saveBusy, setSaveBusy] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);

  const [comments, setComments] = useState<CommentData[] | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const priceLabel = event.price ?? "Free";
  const isLoggedIn = !authLoading && !!user;

  const loadComments = useCallback(async () => {
    setCommentsError(null);

    try {
      const res = await fetch(`/api/events/${event.id}/comments`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data?.error ?? `Failed to load comments. Status: ${res.status}`;
        console.error("[GET comments failed]", res.status, data);
        setComments([]);
        setCommentsError(message);
        return;
      }

      setComments(data?.ok ? data.comments ?? [] : []);
    } catch (error) {
      console.error("[GET comments unexpected]", error);
      setComments([]);
      setCommentsError("Failed to load comments.");
    }
  }, [event.id]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

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
    ])
      .then(([saveRes, joinRes]) => {
        if (saveRes.error) {
          console.error("[load save state failed]", saveRes.error);
        }

        if (joinRes.error) {
          console.error("[load join state failed]", joinRes.error);
        }

        const isSaved = saveRes.data !== null;
        const isJoined = joinRes.data !== null;

        setSaved(isSaved);
        setJoined(isJoined);

        if (isSaved) {
          setSaveCount((count) => Math.max(1, count));
        } else {
          setSaveCount((count) => Math.max(0, count));
        }

        if (isJoined) {
          setJoinCount((count) => Math.max(1, count));
        } else {
          setJoinCount((count) => Math.max(0, count));
        }
      })
      .catch((error) => {
        console.error("[load RSVP state failed]", error);
      });
  }, [authLoading, user, event.id]);

  async function toggleSave() {
    if (!user || !session) {
      router.push("/login");
      return;
    }

    if (saveBusy) return;

    const previousSaved = saved;
    const previousCount = saveCount;
    const nextSaved = !previousSaved;

    setSaveBusy(true);
    setSaved(nextSaved);
    setSaveCount(nextSaved ? previousCount + 1 : Math.max(0, previousCount - 1));

    try {
      const res = await fetch(`/api/events/${event.id}/save`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[save event failed]", res.status, text);

        setSaved(previousSaved);
        setSaveCount(previousCount);
      }
    } catch (error) {
      console.error("[save event unexpected]", error);

      setSaved(previousSaved);
      setSaveCount(previousCount);
    } finally {
      setSaveBusy(false);
    }
  }

  async function toggleJoin() {
    if (!user || !session) {
      router.push("/login");
      return;
    }

    if (joinBusy) return;

    const previousJoined = joined;
    const previousCount = joinCount;
    const nextJoined = !previousJoined;

    setJoinBusy(true);
    setJoined(nextJoined);
    setJoinCount(nextJoined ? previousCount + 1 : Math.max(0, previousCount - 1));

    try {
      const res = await fetch(`/api/events/${event.id}/join`, {
        method: nextJoined ? "POST" : "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[join event failed]", res.status, text);

        setJoined(previousJoined);
        setJoinCount(previousCount);
      }
    } catch (error) {
      console.error("[join event unexpected]", error);

      setJoined(previousJoined);
      setJoinCount(previousCount);
    } finally {
      setJoinBusy(false);
    }
  }

  async function handlePostComment(_eventId: string, body: string) {
    if (!user || !session) {
      router.push("/login");
      throw new Error("Not logged in");
    }

    const cleanBody = body.trim();

    if (!cleanBody) {
      throw new Error("Comment cannot be empty");
    }

    const res = await fetch(`/api/events/${event.id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: cleanBody }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data?.error ?? `Failed to post comment. Status: ${res.status}`;

      console.error("[post comment failed]", res.status, data);

      throw new Error(message);
    }

    if (data?.comment) {
      setComments((current) => [...(current ?? []), data.comment]);
    } else {
      await loadComments();
    }

    return data?.comment;
  }

  async function handleDeleteComment(commentId: string) {
    if (!user || !session) {
      router.push("/login");
      throw new Error("Not logged in");
    }

    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data?.error ?? `Failed to delete comment. Status: ${res.status}`;

      console.error("[delete comment failed]", res.status, data);

      throw new Error(message);
    }

    setComments((current) =>
      current ? current.filter((comment) => comment.id !== commentId) : current
    );
  }

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
                  {event.tags.map((tag) => (
                    <TagButton
                      key={tag}
                      label={`#${tag}`}
                      size="sm"
                      disabled
                    />
                  ))}
                </div>
              </section>
            )}

            <section className={styles.block} aria-label="About">
              <h2 className={styles.blockLabel}>About this event</h2>

              <p className={styles.detailsText}>
                {event.details || "No description provided."}
              </p>
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
                  <Link href="/login">Log in</Link> to save or RSVP to this
                  event.
                </p>
              )}

              {(saveBusy || joinBusy) && (
                <p className={styles.loginHint}>Updating RSVP…</p>
              )}
            </section>

            <section
              className={styles.block}
              id="comments"
              aria-label="Comments"
            >
              <h2 className={styles.blockLabel}>Comments</h2>

              {commentsError && (
                <p className={styles.loginHint}>{commentsError}</p>
              )}

              {comments === null ? (
                <p className={styles.loginHint}>Loading comments…</p>
              ) : isLoggedIn && user ? (
                <CommentSection
                  eventId={event.id}
                  initialComments={comments}
                  currentUserId={user.id}
                  eventCreatorId={event.creatorId}
                  onPost={handlePostComment}
                  onDelete={handleDeleteComment}
                />
              ) : (
                <p className={styles.loginHint}>
                  <Link href="/login">Log in</Link> to view and post comments.
                </p>
              )}
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