"use client";

import { useEffect, useMemo, useState } from "react";
import EventCard from "@/components/EventCard/event-card";
import styles from "./search.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateSort       = "none" | "soonest" | "latest";
type PopularitySort = "none" | "most_interested" | "least_interested" | "most_going" | "least_going";
type CampusFilter   = "all" | "pomona" | "cmc" | "scripps" | "mudd" | "pitzer" | "off_campus" | "other";
type DateFilter     = "all" | "today" | "in3" | "weekend" | "next_week" | "month";

type ApiEvent = {
  id: string;
  title: string;
  description: string;
  location_name: string;
  start_time: string;
  end_time: string | null;
  interested_count: number;
  going_count: number;
};

type DisplayEvent = {
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
  { value: "none",    label: "Date order"    },
  { value: "soonest", label: "Soonest first" },
  { value: "latest",  label: "Latest first"  },
];

const POPULARITY_SORT_OPTIONS: { value: PopularitySort; label: string }[] = [
  { value: "none",             label: "Popularity"          },
  { value: "most_going",       label: "Most going ↑"       },
  { value: "most_interested",  label: "Most interested ↑"  },
  { value: "least_going",      label: "Fewest going ↓"     },
  { value: "least_interested", label: "Fewest interested ↓" },
];

const CAMPUS_OPTIONS: { value: CampusFilter; label: string }[] = [
  { value: "all",        label: "All campuses" },
  { value: "pomona",     label: "Pomona"       },
  { value: "cmc",        label: "CMC"          },
  { value: "scripps",    label: "Scripps"      },
  { value: "mudd",       label: "Harvey Mudd"  },
  { value: "pitzer",     label: "Pitzer"       },
  { value: "off_campus", label: "Off campus"   },
  { value: "other",      label: "Other"        },
];

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all",       label: "All dates"    },
  { value: "today",     label: "Today"        },
  { value: "in3",       label: "In 3 days"    },
  { value: "weekend",   label: "This weekend" },
  { value: "next_week", label: "Next week"    },
  { value: "month",     label: "This month"   },
];

// ─── Campus guesser (maps location_name → campus enum) ───────────────────────

function guessCampus(location: string): CampusFilter {
  const loc = location.toLowerCase();
  if (loc.includes("pomona"))                                 return "pomona";
  if (loc.includes("cmc") || loc.includes("claremont mckenna")) return "cmc";
  if (loc.includes("scripps"))                               return "scripps";
  if (loc.includes("mudd") || loc.includes("harvey mudd"))   return "mudd";
  if (loc.includes("pitzer"))                                return "pitzer";
  if (loc.includes("claremont"))                             return "other";
  return "off_campus";
}

function toDisplayEvent(e: ApiEvent): DisplayEvent {
  return {
    id: e.id,
    title: e.title,
    subTitle: e.location_name,
    tags: [],
    campus: guessCampus(e.location_name),
    startDate: new Date(e.start_time),
    interestedCount: e.interested_count,
    goingCount: e.going_count,
  };
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

type SearchResultsProps = {
  query: string;
  category: string;
  tags: string;
  initialDateFilter?: string;
};

function dateFilterToApiRange(
  filter: DateFilter,
): { start_after: string; start_before?: string } {
  if (filter === "all") {
    return { start_after: new Date().toISOString() };
  }
  const today = startOfDay(new Date());
  const iso = (d: Date) => d.toISOString();

  if (filter === "today")
    return { start_after: iso(today), start_before: iso(addDays(today, 1)) };
  if (filter === "in3")
    return { start_after: iso(today), start_before: iso(addDays(today, 4)) };
  if (filter === "weekend") {
    const day = today.getDay();
    const sat = addDays(today, day === 6 ? 0 : (6 - day + 7) % 7);
    return { start_after: iso(sat), start_before: iso(addDays(sat, 2)) };
  }
  if (filter === "next_week") {
    const day = today.getDay();
    const mon = addDays(today, day === 1 ? 7 : (1 - day + 7) % 7);
    return { start_after: iso(mon), start_before: iso(addDays(mon, 7)) };
  }
  if (filter === "month") {
    return {
      start_after: iso(today),
      start_before: iso(new Date(today.getFullYear(), today.getMonth() + 1, 1)),
    };
  }
  return { start_after: new Date().toISOString() };
}

function toValidDateFilter(raw: string): DateFilter {
  const valid: DateFilter[] = ["all", "today", "in3", "weekend", "next_week", "month"];
  return valid.includes(raw as DateFilter) ? (raw as DateFilter) : "all";
}

export default function SearchResults({
  query,
  category,
  tags,
  initialDateFilter = "all",
}: SearchResultsProps) {
  const [allEvents,      setAllEvents]      = useState<DisplayEvent[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [dateSort,       setDateSort]       = useState<DateSort>("none");
  const [popularitySort, setPopularitySort] = useState<PopularitySort>("none");
  const [campusFilter,   setCampusFilter]   = useState<CampusFilter>("all");
  const [dateFilter,     setDateFilter]     = useState<DateFilter>(toValidDateFilter(initialDateFilter));

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setFetchError(null);
      try {
        const { start_after, start_before } = dateFilterToApiRange(dateFilter);
        const params = new URLSearchParams({ category });
        if (query)        params.set("q",            query);
        if (tags)         params.set("tags",          tags);
        if (start_after)  params.set("start_after",  start_after);
        if (start_before) params.set("start_before", start_before);
        // campus filter: "off_campus" and "other" can't be server-filtered
        // reliably by location_name, so skip those; handle client-side below.
        if (campusFilter !== "all" && campusFilter !== "off_campus" && campusFilter !== "other") {
          params.set("campus", campusFilter);
        }

        const res = await fetch(`/api/events?${params.toString()}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setAllEvents((data.events ?? []).map(toDisplayEvent));
      } catch (err) {
        console.error("[SearchResults] fetch failed", err);
        setFetchError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
    // campusFilter and dateFilter are now included — changing them refetches
  }, [query, category, tags, campusFilter, dateFilter]);

  const results = useMemo(() => {
    let pool = allEvents;

    // Client-side campus fallback for "off_campus" / "other" (no clean server filter)
    if (campusFilter === "off_campus" || campusFilter === "other") {
      pool = pool.filter((e) => e.campus === campusFilter);
    }

    // ── Sort ───────────────────────────────────────────────────────────────
    return [...pool].sort((a, b) => {
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
      if (dateSort === "latest") return b.startDate.getTime() - a.startDate.getTime();
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }, [allEvents, campusFilter, dateSort, popularitySort]);

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
      {/* ── Result count ── */}
      <p className={styles.resultCount}>
        {loading
          ? "Loading…"
          : fetchError
          ? fetchError
          : results.length === 0
          ? "No events found"
          : `${results.length} event${results.length === 1 ? "" : "s"}`}
      </p>

      {/* ── Filter toolbar ── */}
      <div className={styles.toolbar}>
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
      {loading ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Loading events…</p>
        </div>
      ) : fetchError ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{fetchError}</p>
        </div>
      ) : results.length === 0 ? (
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
