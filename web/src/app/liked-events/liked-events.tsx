import EventCollectionPage from "@/components/EventCollectionPage/event-collection-page";
import type { CollectionEvent } from "@/components/EventCollectionPage/event-collection-page";

const LIKED_EVENTS: CollectionEvent[] = [
  {
    id: "2",
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: [
      { id: "2-music", label: "#music" },
      { id: "2-food", label: "#food" },
      { id: "2-outdoors", label: "#outdoors" },
      { id: "2-concert", label: "#concert" },
    ],
    dateText: "Sat, Apr 11",
    timeText: "3:00 PM–10:00 PM",
    interestedCount: 269,
    goingCount: 113,
    ctaLabel: "View Event",
    href: "/events/2",
  },
  {
    id: "4",
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: [
      { id: "4-networking", label: "#networking" },
      { id: "4-startup", label: "#startup" },
    ],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 31,
    goingCount: 18,
    ctaLabel: "View Event",
    href: "/events/4",
  },
];

export default function LikedEventsPage() {
  return (
    <EventCollectionPage
      title="Liked Events"
      backHref="/personalized-dashboard"
      backLabel="Back to dashboard"
      events={LIKED_EVENTS}
      emptyMessage="Events you like will appear here. Start exploring!"
      emptyActionLabel="Browse events"
      emptyActionHref="/search"
    />
  );
}
