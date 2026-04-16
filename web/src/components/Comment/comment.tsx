"use client";

import { useState } from "react";
import styles from "./comment.module.css";

// ─── Types (shaped for Supabase wiring) ──────────────────────────────────────

export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  school?: string; // e.g. "Pomona", "CMC", "Scripps", "Mudd", "Pitzer"
};

export type CommentData = {
  id: string;
  author: CommentAuthor | null; // null = posted anonymously
  body: string;
  createdAt: string; // ISO string or relative label from backend
  replies?: CommentData[];
};

// ─── Props ────────────────────────────────────────────────────────────────────

type CommentProps = {
  comment: CommentData;
  depth?: number; // 0 = top-level, 1 = reply (we only go 1 level deep)
  onReply?: (parentId: string, body: string, anonymous: boolean) => void;
  onDm?: (author: CommentAuthor) => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AvatarPlaceholder({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
      <path
        d="M2 21 23 12 2 3v7l15 2-15 2z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Comment({ comment, depth = 0, onReply, onDm }: CommentProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const isAnon = comment.author === null;
  const displayName = isAnon ? "Anonymous" : comment.author!.name;
  const school = !isAnon && comment.author!.school ? comment.author!.school : null;

  function handleSendReply() {
    const body = replyText.trim();
    if (!body || !onReply) return;
    onReply(comment.id, body, anonymous);
    setReplyText("");
    setShowReplyBox(false);
    setAnonymous(false);
  }

  return (
    <div className={`${styles.root} ${depth > 0 ? styles.reply : ""}`}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          {isAnon ? (
            <AnonAvatar />
          ) : comment.author!.avatarUrl ? (
            <img
              className={styles.avatar}
              src={comment.author!.avatarUrl}
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
          <span className={styles.time}>{comment.createdAt}</span>
        </div>

        {/* DM button — only shown for non-anonymous authors */}
        {!isAnon && onDm ? (
          <button
            type="button"
            className={styles.dmBtn}
            onClick={() => onDm(comment.author!)}
            aria-label={`Send ${displayName} a message`}
          >
            <PaperPlaneIcon />
          </button>
        ) : null}
      </div>

      {/* ── Body ── */}
      <p className={styles.body}>{comment.body}</p>

      {/* ── Actions ── */}
      <div className={styles.actions}>
        {depth === 0 && onReply ? (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowReplyBox((v) => !v)}
          >
            {showReplyBox ? "Cancel" : "Reply"}
          </button>
        ) : null}
      </div>

      {/* ── Inline reply box ── */}
      {showReplyBox ? (
        <div className={styles.replyBox}>
          <textarea
            className={styles.replyInput}
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
          />
          <div className={styles.replyFooter}>
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
              className={styles.sendBtn}
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Nested replies (one level deep) ── */}
      {comment.replies?.length ? (
        <div className={styles.repliesWrap}>
          {comment.replies.map((r) => (
            <Comment key={r.id} comment={r} depth={1} onDm={onDm} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
