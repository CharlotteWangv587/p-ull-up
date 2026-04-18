import styles from "./rsvp-button.module.css";

export type RsvpKind = "interested" | "going";

export type RsvpButtonProps = {
  kind: RsvpKind;
  active?: boolean;
  count?: number;
  onClick?: () => void;
};

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 21s-7-4.6-9.5-8.6C.6 9.2 2.3 5.9 5.6 5.2c2-.4 3.6.6 4.6 1.8 1-1.2 2.6-2.2 4.6-1.8 3.3.7 5 4 3.1 7.2C19 16.4 12 21 12 21z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M9.2 16.6 4.9 12.3l1.4-1.4 2.9 2.9 8-8 1.4 1.4-9.4 9.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function RsvpButton({ kind, active, count, onClick }: RsvpButtonProps) {
  const label = kind === "interested" ? "I'm interested" : "I'm going";
  const activeCls =
    kind === "interested" ? styles.activeInterested : styles.activeGoing;

  return (
    <button
      type="button"
      className={[styles.btn, active ? activeCls : null].filter(Boolean).join(" ")}
      aria-pressed={active ? true : undefined}
      onClick={onClick}
    >
      <span className={styles.icon}>
        {kind === "interested" ? <HeartIcon /> : <CheckIcon />}
      </span>
      <span>
        {label}
        {typeof count === "number" ? <span className={styles.sub}>{count} {kind}</span> : null}
      </span>
    </button>
  );
}

