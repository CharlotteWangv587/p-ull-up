import Link from "next/link";
import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";
import styles from "@/components/EventCollectionPage/event-collection-page.module.css";

const CREATED_EVENTS: CollectionEvent[] = [
  {
    id: "10",
    title: "p-ull up Kickback",
    subTitle: "Scripps Campus",
    tags: [
      { id: "10-party", label: "#party" },
      { id: "10-oncampus", label: "#on campus" },
      { id: "10-scripps", label: "#scripps" },
    ],
    dateText: "Fri, May 2",
    timeText: "9:00 PM–12:00 AM",
    interestedCount: 58,
    goingCount: 34,
    ctaLabel: "View Event",
    href: "/events/10",
  },
  {
    id: "11",
    title: "Claremont Night Market",
    subTitle: "The Quad, CMC",
    tags: [
      { id: "11-food", label: "#food" },
      { id: "11-vendors", label: "#vendors" },
      { id: "11-oncampus", label: "#on campus" },
      { id: "11-cmc", label: "#cmc" },
    ],
    dateText: "Sat, May 10",
    timeText: "5:00 PM–9:00 PM",
    interestedCount: 112,
    goingCount: 67,
    ctaLabel: "View Event",
    href: "/events/11",
  },
  {
    id: "12",
    title: "5C Study Abroad Info Night",
    subTitle: "Hahn, Pomona College",
    tags: [
      { id: "12-academic", label: "#academic" },
      { id: "12-oncampus", label: "#on campus" },
    ],
    dateText: "Wed, Apr 30",
    timeText: "7:00 PM–9:00 PM",
    interestedCount: 21,
    goingCount: 15,
    ctaLabel: "View Event",
    href: "/events/12",
  },
];

export default function CreatedEventsPage() {
  return (
    <EventCollectionPage
      title="Created Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={CREATED_EVENTS}
      showEditButton
      emptyMessage="You haven't created any events yet."
      emptyActionLabel="Post your first event"
      emptyActionHref="/eventposting"
      headerAction={
        <Link href="/eventposting" className={styles.postBtn}>
          + Post New Event
        </Link>
      }
    />
  );
}
