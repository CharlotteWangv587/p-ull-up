import Link from "next/link";
import TagButton from "@/components/TagButton/tag-button";
import styles from "./event-card.module.css";

export type EventCardTag = {
  id: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  accentColor?: string;
};

export type EventCardProps = {
  title: string;
  subTitle?: string; // e.g. venue, city/state
  imageUrl?: string | null;
  imageAlt?: string;
  tags?: EventCardTag[];
  dateText?: string; // keep flexible: "Sat, Apr 11"
  timeText?: string; // "11:00 PM–1:00 AM"
  interestedCount?: number;
  goingCount?: number;
  ctaLabel?: string;
  href?: string; // if provided, CTA becomes a Link
  onCtaClick?: () => void; // if provided (and no href), CTA becomes a button action
  className?: string;
};

function formatCount(n: number) {
  return Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 21s-7-4.6-9.5-8.6C.6 9.2 2.3 5.9 5.6 5.2c2-.4 3.6.6 4.6 1.8 1-1.2 2.6-2.2 4.6-1.8 3.3.7 5 4 3.1 7.2C19 16.4 12 21 12 21z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M9.2 16.6 4.9 12.3l1.4-1.4 2.9 2.9 8-8 1.4 1.4-9.4 9.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function EventCard({
  title,
  subTitle,
  imageUrl,
  imageAlt,
  tags,
  dateText,
  timeText,
  interestedCount,
  goingCount,
  ctaLabel = "View Event",
  href,
  onCtaClick,
  className,
}: EventCardProps) {
  const dateTimeParts = [dateText, timeText].filter(Boolean);
  const dateTimeLabel = dateTimeParts.join(" • ");
  const maxTagsToShow = 3;
  const visibleTags = tags?.slice(0, maxTagsToShow) ?? [];
  const hiddenCount = Math.max(0, (tags?.length ?? 0) - visibleTags.length);

  return (
    <article className={[styles.card, className ?? null].filter(Boolean).join(" ")}>
      <div className={styles.media} aria-label={imageAlt ?? "Event image"}>
        {imageUrl ? <img src={imageUrl} alt={imageAlt ?? "Event"} /> : <span>Event Image</span>}
      </div>

      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{title}</h3>
          {subTitle ? <p className={styles.subTitle}>{subTitle}</p> : null}
        </div>

        {visibleTags.length ? (
          <div className={styles.tagsRow}>
            {visibleTags.map((t) => (
              <TagButton
                key={t.id}
                label={t.label}
                size="sm"
                selected={t.selected}
                onClick={t.onClick}
                ariaLabel={`Tag: ${t.label}`}
                accentColor={t.accentColor}
              />
            ))}
            {hiddenCount > 0 ? (
              <TagButton
                label={`+${hiddenCount} more`}
                size="sm"
                disabled
                ariaLabel={`${hiddenCount} more tags`}
              />
            ) : null}
          </div>
        ) : null}

        {(dateTimeLabel || interestedCount !== undefined || goingCount !== undefined) ? (
          <div className={styles.metaRow}>
            <div className={styles.dateTime}>{dateTimeLabel}</div>

            <div className={styles.counts}>
              {interestedCount !== undefined ? (
                <span className={styles.countItem} aria-label={`${interestedCount} interested`}>
                  <span style={{ color: "#ef4444" }}>
                    <HeartIcon />
                  </span>
                  {formatCount(interestedCount)}
                </span>
              ) : null}
              {goingCount !== undefined ? (
                <span className={styles.countItem} aria-label={`${goingCount} going`}>
                  <span style={{ color: "#22c55e" }}>
                    <CheckIcon />
                  </span>
                  {formatCount(goingCount)}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {href ? (
          <Link className={styles.ctaLink} href={href} role="button">
            {ctaLabel}
          </Link>
        ) : (
          <button className={styles.cta} type="button" onClick={onCtaClick}>
            {ctaLabel}
          </button>
        )}
      </div>
    </article>
  );
}

