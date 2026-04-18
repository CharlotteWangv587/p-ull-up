import Link from "next/link";
import Navbar from "@/components/Navbar/navbar";
import EventCard from "@/components/EventCard/event-card";
import styles from "./events.module.css";

const mockEvents = [
  {
    id: "1",
    title: "Afrofusion",
    subTitle: "Dom's Lounge",
    tags: ["party", "on campus", "pomona", "afrobeats"],
    dateText: "Sat, Apr 11",
    timeText: "11:00 PM–1:00 AM",
    interestedCount: 47,
    goingCount: 76,
  },
  {
    id: "2",
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: ["music", "food", "outdoors", "vendors", "concert", "tattoos", "flea market"],
    dateText: "Saturday, Apr 11",
    timeText: "3:00 PM - 10:00 PM",
    interestedCount: 269,
    goingCount: 113,
  },
  {
    id: "3",
    title: "Beginner Daze 5C Surf Club x POCO",
    subTitle: "Santa Monica",
    tags: ["surfing", "outdoors", "off campus"],
    dateText: "Sunday, Apr 19",
    timeText: "9:00 AM - 4:00 PM",
    interestedCount: 25,
    goingCount: 14,
  },
  {
    id: "4",
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: ["networking", "startup"],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 31,
    goingCount: 18,
  },
] as const;

export default function EventsIndexPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.title}>Events</h1>
          <Link className={styles.createLink} href="/eventposting">
            Create event
          </Link>
        </div>

        <div className={styles.grid}>
          {mockEvents.map((e) => (
            <EventCard
              key={e.id}
              title={e.title}
              subTitle={e.subTitle}
              tags={e.tags.map((t) => ({ id: `${e.id}-${t}`, label: `#${t}` }))}
              dateText={e.dateText}
              timeText={e.timeText}
              interestedCount={e.interestedCount}
              goingCount={e.goingCount}
              ctaLabel="View Event"
              href={`/events/${e.id}`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

