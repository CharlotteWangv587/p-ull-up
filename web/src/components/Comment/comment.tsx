"use client";

import { useState } from "react";
import styles from "./comment.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CommentAuthor = {
  id?: string;
  name?: string | null;
  avatarUrl?: string | null;
  school?: string | null;
};

export type CommentData = {
  id: string;
  author?: CommentAuthor | null;
  body: string;
  createdAt?: string | null;
  created_at?: string | null;
  replies?: CommentData[];
};

// ─── Props ───────────────────────────────────────────────────────────────────

type CommentProps = {
  comment: CommentData;
  depth?: number;
  onReply?: (parentId: string, body: string, anonymous: boolean) => void;
  onDm?: (author: CommentAuthor) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  eventCreatorId?: string;
  isAdmin?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AvatarPlaceholder({ name, size = 34 }: { name: string; size?: number }) {
  const initials =
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <span
      className={styles.avatarPlaceholder}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function AnonAvatar({ size = 34 }: { size?: number }) {
  return (
    <span
      className={styles.avatarAnon}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
        <path
          d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M2 21 23 12 2 3v7l15 2-15 2z" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M9 3h6l1 1h4v2H4V4h4l1-1ZM5 7h14l-1 13H6L5 7Zm4 2v9h1V9H9Zm5 0v9h1V9h-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatCommentTime(comment: CommentData): string {
  return comment.createdAt ?? comment.created_at ?? "";
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Comment({
  comment,
  depth = 0,
  onReply,
  onDm,
  onDelete,
  currentUserId,
  eventCreatorId,
  isAdmin,
}: CommentProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const author = comment.author ?? null;
  const isAnon = !author;

  const displayName = author?.name?.trim() || "Anonymous";
  const school = author?.school?.trim() || null;
  const createdAt = formatCommentTime(comment);

  const canDelete =
    !!onDelete &&
    !!currentUserId &&
    (isAdmin ||
      currentUserId === eventCreatorId ||
      (!!author?.id && author.id === currentUserId));

  function handleSendReply() {
    const body = replyText.trim();

    if (!body || !onReply) return;

    onReply(comment.id, body, anonymous);
    setReplyText("");
    setShowReplyBox(false);
    setAnonymous(false);
  }

  function handleDeleteClick() {
    if (!onDelete) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    onDelete(comment.id);
    setConfirmDelete(false);
  }

  return (
    <div className={`${styles.root} ${depth > 0 ? styles.reply : ""}`}>
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          {isAnon ? (
            <AnonAvatar />
          ) : author?.avatarUrl ? (
            <img
              className={styles.avatar}
              src={author.avatarUrl}
              alt={displayName}
              width={34}
              height={34}
            />
          ) : (
            <AvatarPlaceholder name={displayName} />
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.name}>
            {displayName}
            {school ? <span className={styles.school}> · {school}</span> : null}
          </span>

          {createdAt ? <span className={styles.time}>{createdAt}</span> : null}
        </div>

        {!isAnon && author && onDm ? (
          <button
            type="button"
            className={styles.dmBtn}
            onClick={() => onDm(author)}
            aria-label={`Send ${displayName} a message`}
          >
            <PaperPlaneIcon />
          </button>
        ) : null}
      </div>

      <p className={styles.body}>{comment.body}</p>

      <div className={styles.actions}>
        {depth === 0 && onReply ? (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowReplyBox((value) => !value)}
          >
            {showReplyBox ? "Cancel" : "Reply"}
          </button>
        ) : null}

        {canDelete ? (
          confirmDelete ? (
            <span className={styles.deleteConfirm}>
              Delete?{" "}
              <button
                type="button"
                className={styles.deleteConfirmYes}
                onClick={handleDeleteClick}
              >
                Yes
              </button>{" "}
              <button
                type="button"
                className={styles.deleteConfirmNo}
                onClick={() => setConfirmDelete(false)}
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDeleteClick}
              aria-label="Delete comment"
            >
              <TrashIcon />
              Delete
            </button>
          )
        ) : null}
      </div>

      {showReplyBox ? (
        <div className={styles.replyBox}>
          <textarea
            className={styles.replyInput}
            placeholder="Write a reply…"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            rows={2}
          />

          <div className={styles.replyFooter}>
            <label className={styles.anonToggle}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Post anonymously
            </label>

            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      {comment.replies?.length ? (
        <div className={styles.repliesWrap}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={1}
              onDm={onDm}
              onDelete={onDelete}
              currentUserId={currentUserId}
              eventCreatorId={eventCreatorId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}