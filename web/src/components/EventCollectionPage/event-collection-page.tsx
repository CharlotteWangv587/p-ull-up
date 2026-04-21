import Link from "next/link";
import EventCard, { EventCardProps } from "@/components/EventCard/event-card";
import Navbar from "@/components/Navbar/navbar";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import styles from "./event-collection-page.module.css";

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export type CollectionEvent = EventCardProps & {
  id: string;
};

type EventCollectionPageProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  events: CollectionEvent[];
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  /** If true, each card gets a floating edit button */
  showEditButton?: boolean;
  /** Slot for an action button in the header (e.g. "Post New Event") */
  headerAction?: React.ReactNode;
};

export default function EventCollectionPage({
  title,
  backHref = "/",
  backLabel = "Back to dashboard",
  events,
  emptyMessage = "Nothing here yet.",
  emptyActionLabel,
  emptyActionHref,
  showEditButton = false,
  headerAction,
}: EventCollectionPageProps) {
  return (
    <div className={styles.page}>
      <Navbar
        showAuth={false}
        rightContent={
          <>
            <NotificationButton />
            <ProfileDropdown />
          </>
        }
      />

      <div className={styles.pageHeader}>
        <div>
          <Link href={backHref} className={styles.backLink}>
            ← {backLabel}
          </Link>
          <div className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <p className={styles.pageCount}>
              {events.length === 0
                ? "No events"
                : events.length === 1
                ? "1 event"
                : `${events.length} events`}
            </p>
          </div>
        </div>
        {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
      </div>

      <section className={styles.section}>
        <div className={styles.grid}>
          {events.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyMsg}>{emptyMessage}</p>
              {emptyActionLabel && emptyActionHref && (
                <Link href={emptyActionHref} className={styles.emptyAction}>
                  {emptyActionLabel}
                </Link>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={styles.cardWrap}>
                <EventCard {...event} />
                {showEditButton && (
                  <Link
                    href={`/events/${event.id}/edit`}
                    className={styles.editBtn}
                    aria-label={`Edit ${event.title}`}
                  >
                    <PencilIcon />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
