"use client";

import { useState } from "react";
import Comment, { type CommentData, type CommentAuthor } from "./comment";
import styles from "./comment-section.module.css";

// ─── Props ────────────────────────────────────────────────────────────────────
// All callbacks are optional stubs — swap them out for real Supabase mutations.

export type CommentSectionProps = {
  eventId: string;
  initialComments?: CommentData[];
  /** The currently logged-in user's ID (undefined = not signed in) */
  currentUserId?: string;
  /** The user ID of whoever created this event */
  eventCreatorId?: string;
  /** True when the current user is a backend admin */
  isAdmin?: boolean;
  /** Called when a top-level comment is submitted. Replace with Supabase insert. */
  onPost?: (eventId: string, body: string, anonymous: boolean) => Promise<void>;
  /** Called when a reply is submitted. Replace with Supabase insert. */
  onReply?: (parentId: string, body: string, anonymous: boolean) => Promise<void>;
  /**
   * Called when a comment is deleted.
   * Wire this up to DELETE /api/comments/:commentId with the user's Bearer token.
   */
  onDelete?: (commentId: string) => Promise<void>;
  /** Called when the DM button is tapped. Replace with routing to DM thread. */
  onDm?: (author: CommentAuthor) => void;
};

// ─── Seed data (used until backend is wired) ─────────────────────────────────

const SEED: CommentData[] = [
  {
    id: "c1",
    author: { id: "u1", name: "Jasmine T.", school: "Pomona" },
    body: "This looks so fun — anyone carpooling from the dorms?",
    createdAt: "2h ago",
    replies: [
      {
        id: "c1r1",
        author: { id: "u2", name: "Marcus W.", school: "Mudd" },
        body: "I have a car! Posting in the carpool group now.",
        createdAt: "1h ago",
      },
    ],
  },
  {
    id: "c2",
    author: null, // anonymous
    body: "Is this 21+?",
    createdAt: "3h ago",
    replies: [],
  },
  {
    id: "c3",
    author: { id: "u3", name: "Ava R.", school: "Scripps" },
    body: "Went last year — the line moves fast after 10 pm, just FYI.",
    createdAt: "5h ago",
    replies: [],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommentSection({
  eventId,
  initialComments,
  currentUserId,
  eventCreatorId,
  isAdmin,
  onPost,
  onReply,
  onDelete,
  onDm,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(
    initialComments ?? SEED
  );
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    try {
      if (onPost) {
        await onPost(eventId, text, anonymous);
      }
      // Optimistic local add (replaced by real data once backend returns it)
      const newComment: CommentData = {
        id: `local-${Date.now()}`,
        author: anonymous ? null : { id: currentUserId ?? "me", name: "You" },
        body: text,
        createdAt: "Just now",
        replies: [],
      };
      setComments((prev) => [newComment, ...prev]);
      setBody("");
      setAnonymous(false);
    } finally {
      setPosting(false);
    }
  }

  function handleReply(parentId: string, replyBody: string, anon: boolean) {
    onReply?.(parentId, replyBody, anon);
    // Optimistic
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies ?? []),
                {
                  id: `local-reply-${Date.now()}`,
                  author: anon
                    ? null
                    : { id: currentUserId ?? "me", name: "You" },
                  body: replyBody,
                  createdAt: "Just now",
                },
              ],
            }
          : c
      )
    );
  }

  async function handleDelete(commentId: string) {
    // Optimistic: remove from state immediately so the UI feels instant.
    setComments((prev) => {
      // Try removing a top-level comment first.
      const withoutTop = prev.filter((c) => c.id !== commentId);
      if (withoutTop.length !== prev.length) return withoutTop;

      // Otherwise remove from the replies of any top-level comment.
      return prev.map((c) => ({
        ...c,
        replies: c.replies?.filter((r) => r.id !== commentId),
      }));
    });

    // Then call the backend (fire-and-forget; you can add error recovery later).
    try {
      await onDelete?.(commentId);
    } catch (err) {
      console.error("Failed to delete comment", err);
      // TODO: restore the comment in state and show a toast on failure
    }
  }

  return (
    <div className={styles.section}>
      {/* ── Compose box ── */}
      <div className={styles.compose}>
        <textarea
          className={styles.input}
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
        />
        <div className={styles.composeFooter}>
          <label className={styles.anonToggle}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Post anonymously
          </label>
          <button
            type="button"
            className={styles.postBtn}
            onClick={handlePost}
            disabled={!body.trim() || posting}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {/* ── Comment list ── */}
      <div className={styles.list}>
        {comments.length === 0 ? (
          <p className={styles.empty}>No comments yet — be the first!</p>
        ) : (
          comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              depth={0}
              onReply={handleReply}
              onDm={onDm}
              onDelete={handleDelete}
              currentUserId={currentUserId}
              eventCreatorId={eventCreatorId}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
}
