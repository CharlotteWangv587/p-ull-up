"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard/event-card";
import styles from "./search.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateSort       = "none" | "soonest" | "latest";
type PopularitySort = "none" | "most_interested" | "least_interested" | "most_going" | "least_going";
type CampusFilter   = "all" | "pomona" | "cmc" | "scripps" | "mudd" | "pitzer" | "off_campus" | "other";
type DateFilter     = "all" | "today" | "in3" | "in5" | "weekend" | "next_week" | "month";

type MockEvent = {
  id: string;
  title: string;
  subTitle: string;
  tags: string[];
  campus: CampusFilter;
  startDate: Date;
  interestedCount: number;
  goingCount: number;
};

// ─── Filter / sort option labels ─────────────────────────────────────────────

const DATE_SORT_OPTIONS: { value: DateSort; label: string }[] = [
  { value: "none",    label: "Date order"       },
  { value: "soonest", label: "Soonest first"    },
  { value: "latest",  label: "Latest first"     },
];

const POPULARITY_SORT_OPTIONS: { value: PopularitySort; label: string }[] = [
  { value: "none",             label: "Popularity"            },
  { value: "most_going",       label: "Most going ↑"         }, 
  { value: "most_interested",  label: "Most interested ↑"    },
  { value: "least_going",      label: "Fewest going ↓"        },
  { value: "least_interested", label: "Fewest interested ↓"   }

];

const CAMPUS_OPTIONS: { value: CampusFilter; label: string }[] = [
  { value: "all",       label: "All campuses"  },
  { value: "pomona",    label: "Pomona"        },
  { value: "cmc",       label: "CMC"           },
  { value: "scripps",   label: "Scripps"       },
  { value: "mudd",      label: "Harvey Mudd"   },
  { value: "pitzer",    label: "Pitzer"        },
  { value: "off_campus",label: "Off campus"    },
  { value: "other",     label: "Other"         },
];

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all",       label: "All dates"     },
  { value: "today",     label: "Today"         },
  { value: "in3",       label: "In 3 days"     },
  { value: "in5",       label: "In 5 days"     },
  { value: "weekend",   label: "This weekend"  },
  { value: "next_week", label: "Next week"     },
  { value: "month",     label: "This month"    },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace buildMockEvents() with a real fetch / Supabase query when wiring backend.
// Backend filter mapping:
//   campus       → WHERE location_tag = :campus
//   dateFilter   → WHERE start_time >= :from AND start_time < :to
//   dateSort     → ORDER BY start_time ASC/DESC
//   popularitySort → ORDER BY interested_count/going_count ASC/DESC
// Compound sort: apply popularitySort first, dateSort as tiebreaker.

function buildMockEvents(): MockEvent[] {
  function d(daysFromNow: number, hour = 20): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  return [
    {
      id: "s1",
      title: "Afrofusion Night",
      subTitle: "Dom's Lounge · Pomona",
      tags: ["party", "music", "on campus"],
      campus: "pomona",
      startDate: d(0, 23),
      interestedCount: 47,
      goingCount: 76,
    },
    {
      id: "s2",
      title: "Rooftop Social",
      subTitle: "Scripps Campus",
      tags: ["social", "on campus", "outdoors"],
      campus: "scripps",
      startDate: d(1, 19),
      interestedCount: 35,
      goingCount: 22,
    },
    {
      id: "s3",
      title: "Nochella",
      subTitle: "Walker Beach · CMC",
      tags: ["music", "food", "outdoors", "vendors", "concert"],
      campus: "cmc",
      startDate: d(2, 15),
      interestedCount: 269,
      goingCount: 113,
    },
    {
      id: "s4",
      title: "Sunday Brunch Crawl",
      subTitle: "Claremont Village",
      tags: ["food", "off campus", "social"],
      campus: "off_campus",
      startDate: d(2, 11),
      interestedCount: 88,
      goingCount: 41,
    },
    {
      id: "s5",
      title: "Study Sessions w/ Coffee",
      subTitle: "Honnold Library · Claremont",
      tags: ["on campus", "academic"],
      campus: "other",
      startDate: d(3, 14),
      interestedCount: 15,
      goingCount: 8,
    },
    {
      id: "s6",
      title: "5C Comedy Show",
      subTitle: "Garrison Theatre · CMC",
      tags: ["on campus", "club", "entertainment"],
      campus: "cmc",
      startDate: d(4, 20),
      interestedCount: 103,
      goingCount: 89,
    },
    {
      id: "s7",
      title: "Beginner Surf Day",
      subTitle: "Santa Monica Beach",
      tags: ["outdoors", "sports", "off campus"],
      campus: "off_campus",
      startDate: d(5, 9),
      interestedCount: 25,
      goingCount: 14,
    },
    {
      id: "s8",
      title: "Techstars Mixer",
      subTitle: "DTLA",
      tags: ["networking", "startup", "off campus"],
      campus: "off_campus",
      startDate: d(7, 18),
      interestedCount: 31,
      goingCount: 18,
    },
    {
      id: "s9",
      title: "5C Career Fair",
      subTitle: "Pomona College Lawn",
      tags: ["on campus", "career", "networking"],
      campus: "pomona",
      startDate: d(7, 10),
      interestedCount: 180,
      goingCount: 150,
    },
    {
      id: "s10",
      title: "Art Walk DTLA",
      subTitle: "Downtown Los Angeles",
      tags: ["art", "off campus", "social"],
      campus: "off_campus",
      startDate: d(8, 17),
      interestedCount: 72,
      goingCount: 55,
    },
    {
      id: "s11",
      title: "End of Semester Bonfire",
      subTitle: "Pomona Back Field",
      tags: ["party", "outdoors", "on campus"],
      campus: "pomona",
      startDate: d(12, 21),
      interestedCount: 140,
      goingCount: 98,
    },
    {
      id: "s12",
      title: "Claremont Night Market",
      subTitle: "The Quad · CMC",
      tags: ["food", "outdoors", "on campus", "vendors"],
      campus: "cmc",
      startDate: d(13, 17),
      interestedCount: 95,
      goingCount: 67,
    },
    {
      id: "s13",
      title: "Pitzer Art After Dark",
      subTitle: "Pitzer College",
      tags: ["art", "on campus", "club"],
      campus: "pitzer",
      startDate: d(4, 18),
      interestedCount: 58,
      goingCount: 39,
    },
    {
      id: "s14",
      title: "Mudd Hack Night",
      subTitle: "Harvey Mudd · Sprague",
      tags: ["on campus", "academic", "club"],
      campus: "mudd",
      startDate: d(6, 21),
      interestedCount: 44,
      goingCount: 32,
    },
  ];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

type DateBounds = { from: Date; to: Date };

/**
 * Returns an exclusive [from, to) range for the given time-window filter.
 * Backend mapping: WHERE start_time >= :from AND start_time < :to
 */
function getDateBounds(filter: DateFilter): DateBounds | null {
  if (filter === "all") return null;
  const today = startOfDay(new Date());

  if (filter === "today")    return { from: today, to: addDays(today, 1) };
  if (filter === "in3")      return { from: today, to: addDays(today, 4) };
  if (filter === "in5")      return { from: today, to: addDays(today, 6) };
  if (filter === "weekend") {
    const day = today.getDay();
    const daysToSat = day === 6 ? 0 : (6 - day + 7) % 7;
    const sat = addDays(today, daysToSat);
    return { from: sat, to: addDays(sat, 2) };
  }
  if (filter === "next_week") {
    const day = today.getDay();
    const daysToMon = day === 1 ? 7 : (1 - day + 7) % 7;
    const mon = addDays(today, daysToMon);
    return { from: mon, to: addDays(mon, 7) };
  }
  if (filter === "month") {
    return { from: today, to: new Date(today.getFullYear(), today.getMonth() + 1, 1) };
  }
  return null;
}

function matchesDateFilter(date: Date, filter: DateFilter): boolean {
  const bounds = getDateBounds(filter);
  if (!bounds) return true;
  const day = startOfDay(date);
  return day >= bounds.from && day < bounds.to;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

type SearchResultsProps = { query: string; category: string };

export default function SearchResults({ query, category }: SearchResultsProps) {
  const [dateSort,        setDateSort]        = useState<DateSort>("none");
  const [popularitySort,  setPopularitySort]  = useState<PopularitySort>("none");
  const [campusFilter,    setCampusFilter]    = useState<CampusFilter>("all");
  const [dateFilter,      setDateFilter]      = useState<DateFilter>("all");

  const allEvents = useMemo(() => buildMockEvents(), []);

  const results = useMemo(() => {
    let pool = allEvents;

    // ── 1. Text query ──────────────────────────────────────────────────────
    const q = query.trim().toLowerCase();
    if (q) {
      pool = pool.filter((e) => {
        if (category === "event")  return e.title.toLowerCase().includes(q);
        if (category === "campus") return e.subTitle.toLowerCase().includes(q);
        return (
          e.title.toLowerCase().includes(q) ||
          e.subTitle.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // ── 2. Campus filter ──────────────────────────────────────────────────
    if (campusFilter !== "all") {
      pool = pool.filter((e) => e.campus === campusFilter);
    }

    // ── 3. Date window filter ─────────────────────────────────────────────
    pool = pool.filter((e) => matchesDateFilter(e.startDate, dateFilter));

    // ── 4. Sort ───────────────────────────────────────────────────────────
    // Popularity is the primary sort when set; date is the secondary sort
    // (or sole sort if only date is set). Default fallback: soonest first.
    return [...pool].sort((a, b) => {
      // Primary: popularity
      if (popularitySort !== "none") {
        const diff = (() => {
          switch (popularitySort) {
            case "most_interested":  return b.interestedCount - a.interestedCount;
            case "least_interested": return a.interestedCount - b.interestedCount;
            case "most_going":       return b.goingCount - a.goingCount;
            case "least_going":      return a.goingCount - b.goingCount;
          }
        })();
        if (diff !== 0) return diff;
      }
      // Secondary (or primary if popularity not set): date
      if (dateSort === "latest") return b.startDate.getTime() - a.startDate.getTime();
      // "soonest" or default
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }, [allEvents, query, category, campusFilter, dateFilter, dateSort, popularitySort]);

  const hasActiveFilters =
    dateSort !== "none" ||
    popularitySort !== "none" ||
    campusFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setDateSort("none");
    setPopularitySort("none");
    setCampusFilter("all");
    setDateFilter("all");
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {query ? (
              <>
                Results for{" "}
                <span className={styles.queryHighlight}>&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Browse all events"
            )}
          </h1>
          <p className={styles.resultCount}>
            {results.length === 0
              ? "No events found"
              : `${results.length} event${results.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/eventposting" className={styles.createLink}>
          Create event
        </Link>
      </div>

      {/* ── Filter toolbar ── */}
      <div className={styles.toolbar}>

        {/* Date sort */}
        <select
          className={`${styles.filterSelect} ${dateSort !== "none" ? styles.filterSelectActive : ""}`}
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value as DateSort)}
          aria-label="Sort by date"
        >
          {DATE_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Popularity sort */}
        <select
          className={`${styles.filterSelect} ${popularitySort !== "none" ? styles.filterSelectActive : ""}`}
          value={popularitySort}
          onChange={(e) => setPopularitySort(e.target.value as PopularitySort)}
          aria-label="Sort by popularity"
        >
          {POPULARITY_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Campus filter */}
        <select
          className={`${styles.filterSelect} ${campusFilter !== "all" ? styles.filterSelectActive : ""}`}
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value as CampusFilter)}
          aria-label="Filter by campus"
        >
          {CAMPUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" className={styles.clearBtn} onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      {/* ── "When" date window pills ── */}
      <div className={styles.whenRow} role="group" aria-label="Filter by date window">
        <span className={styles.toolbarLabel}>When</span>
        <div className={styles.whenPills}>
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles.whenPill} ${
                dateFilter === f.value ? styles.whenPillActive : ""
              }`}
              onClick={() => setDateFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {results.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No events match your search</p>
          <p className={styles.emptyHint}>
            Try adjusting your filters or{" "}
            <button type="button" className={styles.emptyReset} onClick={clearFilters}>
              clear all filters
            </button>
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {results.map((e) => (
            <EventCard
              key={e.id}
              title={e.title}
              subTitle={e.subTitle}
              tags={e.tags.map((t) => ({ id: `${e.id}-${t}`, label: `#${t}` }))}
              dateText={formatDate(e.startDate)}
              timeText={formatTime(e.startDate)}
              interestedCount={e.interestedCount}
              goingCount={e.goingCount}
              ctaLabel="View Event"
              href={`/events/${e.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
