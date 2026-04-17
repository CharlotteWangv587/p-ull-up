"use client";

import styles from "./notification-button.module.css";

const BellIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

type NotificationButtonProps = {
  /** Number of unread notifications — pass 0 or omit to hide badge */
  count?: number;
  onClick?: () => void;
};

/**
 * Reusable notification bell button.
 * Connect `onClick` and `count` to your notifications API/context.
 */
export default function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={onClick}
        aria-label={count > 0 ? `${count} unread notifications` : "View notifications"}
      >
        <BellIcon />
      </button>
      {count > 0 && (
        <span className={styles.badge} aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}
