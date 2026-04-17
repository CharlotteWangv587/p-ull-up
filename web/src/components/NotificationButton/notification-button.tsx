"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./notification-button.module.css";

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "comment_reply"
  | "event_like"
  | "event_going"
  | "liked_comment"
  | "attending_comment";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  timeAgo: string;
  read: boolean;
};

// ── Default mock data (replace with real API data via props) ─────────────────

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "event_like",
    message: "Jordan liked your event Nochella",
    timeAgo: "2m ago",
    read: false,
  },
  {
    id: "2",
    type: "event_going",
    message: "3 people are now going to your event Afrofusion",
    timeAgo: "15m ago",
    read: false,
  },
  {
    id: "3",
    type: "comment_reply",
    message: "Maya replied to your comment on Techstars Mixer",
    timeAgo: "1h ago",
    read: false,
  },
  {
    id: "4",
    type: "liked_comment",
    message: "New comment on Beginner Daze — an event you liked",
    timeAgo: "3h ago",
    read: true,
  },
  {
    id: "5",
    type: "attending_comment",
    message: "New comment on Nochella — an event you're attending",
    timeAgo: "1d ago",
    read: true,
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CalendarCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="9 16 11 18 15 14" />
  </svg>
);

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  comment_reply:     { icon: <CommentIcon />,      color: "#9733ee" },
  event_like:        { icon: <HeartIcon />,         color: "#e91e8c" },
  event_going:       { icon: <CalendarCheckIcon />, color: "#16a34a" },
  liked_comment:     { icon: <CommentIcon />,       color: "#ea580c" },
  attending_comment: { icon: <CommentIcon />,       color: "#0284c7" },
};

// ── Component ─────────────────────────────────────────────────────────────────

type NotificationButtonProps = {
  /**
   * Notification items to display.
   * Defaults to mock data — replace with real data from your API/context.
   */
  notifications?: NotificationItem[];
};

export default function NotificationButton({
  notifications = MOCK_NOTIFICATIONS,
}: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const wrapRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "View notifications"}
      >
        <BellIcon />
      </button>

      {unreadCount > 0 && (
        <span className={styles.badge} aria-hidden>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notifications">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={markAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <ul className={styles.list} role="list">
            {items.length === 0 ? (
              <li className={styles.empty}>You&apos;re all caught up!</li>
            ) : (
              items.map((item) => {
                const cfg = TYPE_CONFIG[item.type];
                return (
                  <li
                    key={item.id}
                    className={`${styles.item} ${item.read ? styles.itemRead : styles.itemUnread}`}
                    onClick={() => markOneRead(item.id)}
                    role="listitem"
                    style={{ "--accent": cfg.color } as React.CSSProperties}
                  >
                    <span className={styles.itemIcon} style={{ color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    <div className={styles.itemBody}>
                      <p className={styles.itemMsg}>{item.message}</p>
                      <span className={styles.itemTime}>{item.timeAgo}</span>
                    </div>
                    {!item.read && <span className={styles.unreadDot} aria-hidden />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
