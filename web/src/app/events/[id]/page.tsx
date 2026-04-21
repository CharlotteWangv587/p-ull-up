import EventDetails from "./event-details";

const mockEvents = [
  {
    id: "1",
    title: "Afrofusion",
    posterUrl: null,
    location: "Dom's Lounge",
    time: "Sat, Apr 11 • 11:00 PM–1:00 AM",
    price: null,
    tags: ["party", "on campus", "pomona", "afrobeats"],
    details:
      "Pull up for Afrofusion at Dom’s Lounge. Expect great music, good energy, and a packed dance floor. Bring friends and come early if you want a better spot.",
    interestedCount: 47,
    goingCount: 76,
  },
  {
    id: "2",
    title: "Nochella",
    posterUrl: null,
    location: "Walker Beach",
    time: "Saturday, Apr 11 • 3:00 PM–10:00 PM",
    price: "$10",
    tags: ["music", "food", "outdoors", "vendors", "concert", "tattoos", "flea market"],
    details:
      "A campus festival-style day with music, food vendors, pop-ups, and activities. Come hang out, explore booths, and stay for the performances.",
    interestedCount: 269,
    goingCount: 113,
  },
  {
    id: "3",
    title: "Beginner Daze 5C Surf Club x POCO",
    posterUrl: null,
    location: "Santa Monica",
    time: "Sunday, Apr 19 • 9:00 AM–4:00 PM",
    price: null,
    tags: ["surfing", "outdoors", "off campus"],
    details:
      "Beginner-friendly surf day with coaching and good vibes. We’ll coordinate meetup details and carpooling closer to the date.",
    interestedCount: 25,
    goingCount: 14,
  },
  {
    id: "4",
    title: "Techstars Mixer",
    posterUrl: null,
    location: "DTLA",
    time: "Thu, Apr 24 • 6:00 PM",
    price: null,
    tags: ["networking", "startup"],
    details:
      "Meet founders, builders, and operators. Light refreshments and lots of people to connect with. Bring a friend and your best intro.",
    interestedCount: 31,
    goingCount: 18,
  },
] as const;

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = mockEvents.find((e) => e.id === id) ?? mockEvents[0];

  // ── TODO: replace with real session when auth is wired ───────────────────
  // e.g. const session = await getServerSession(); currentUserId = session.user.id
  // "u1" matches the first seed comment author so the Delete button is visible
  // during development. Remove / replace before shipping.
  const currentUserId = "u1";

  return (
    <EventDetails
      event={event}
      currentUserId={currentUserId}
      onDeleteComment={async (commentId) => {
        "use server";
        // TODO: swap for a real fetch() call with the user's Bearer token once
        // auth is wired. The API route is already live at
        // DELETE /api/comments/:commentId
        console.log("[mock] delete comment", commentId);
      }}
    />
  );
}

