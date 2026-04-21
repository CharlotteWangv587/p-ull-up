import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";

const ATTENDING_EVENTS: CollectionEvent[] = [
  {
    id: "1",
    title: "Afrofusion",
    subTitle: "Dom's Lounge",
    tags: [
      { id: "1-party", label: "#party" },
      { id: "1-oncampus", label: "#on campus" },
      { id: "1-pomona", label: "#pomona" },
      { id: "1-afrobeats", label: "#afrobeats" },
    ],
    dateText: "Sat, Apr 11",
    timeText: "11:00 PM–1:00 AM",
    interestedCount: 47,
    goingCount: 76,
    ctaLabel: "View Event",
    href: "/events/1",
  },
  {
    id: "3",
    title: "Beginner Daze 5C Surf Club x POCO",
    subTitle: "Santa Monica",
    tags: [
      { id: "3-surfing", label: "#surfing" },
      { id: "3-outdoors", label: "#outdoors" },
      { id: "3-offcampus", label: "#off campus" },
    ],
    dateText: "Sun, Apr 19",
    timeText: "9:00 AM–4:00 PM",
    interestedCount: 25,
    goingCount: 14,
    ctaLabel: "View Event",
    href: "/events/3",
  },
];

export default function AttendingEventsPage() {
  return (
    <EventCollectionPage
      title="Attending Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={ATTENDING_EVENTS}
      emptyMessage="Events you're going to will appear here."
      emptyActionLabel="Browse events"
      emptyActionHref="/events"
    />
  );
}
