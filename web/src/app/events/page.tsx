"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Navbar from "@/components/Navbar/navbar";
import { useAuth } from "@/context/auth";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import EventCard from "@/components/EventCard/event-card";
import AnimatedPageBackground from "@/components/AnimatedPageBackground/animated-page-background";
import TagButton from "@/components/TagButton/tag-button";
import { DEFAULT_PRESET_TAGS, normalizeTag } from "@/components/TagInput/tag-input";
import { CAMPUS_TAGS, TIME_OPTIONS } from "@/components/Navbar/navbar";
import { getCampusColor } from "@/lib/campus";
import styles from "./events.module.css";

const mockEvents = [
  {
    id: "1",
    title: "Afrofusion",
    subTitle: "Dom's Lounge",
    tags: ["pomona", "party", "on campus", "afrobeats"],
    dateText: "Sat, Apr 11",
    timeText: "11:00 PM–1:00 AM",
    interestedCount: 47,
    goingCount: 76,
  },
  {
    id: "2",
    title: "Nochella",
    subTitle: "Walker Beach",
    tags: ["pitzer", "music", "food", "outdoors", "vendors", "concert"],
    dateText: "Saturday, Apr 11",
    timeText: "3:00 PM - 10:00 PM",
    interestedCount: 269,
    goingCount: 113,
  },
  {
    id: "3",
    title: "Beginner Daze 5C Surf Club x POCO",
    subTitle: "Santa Monica",
    tags: ["all 5cs", "surfing", "outdoors", "off campus"],
    dateText: "Sunday, Apr 19",
    timeText: "9:00 AM - 4:00 PM",
    interestedCount: 25,
    goingCount: 14,
  },
  {
    id: "4",
    title: "Techstars Mixer",
    subTitle: "DTLA",
    tags: ["cmc", "networking", "startup"],
    dateText: "Thu, Apr 24",
    timeText: "6:00 PM",
    interestedCount: 31,
    goingCount: 18,
  },
] as const;

type SearchCategory = "keyword" | "event" | "campus";

const SEARCH_CATEGORIES: { value: SearchCategory; label: string; placeholder: string }[] = [
  { value: "keyword", label: "Keyword",    placeholder: "Type a tag and press Enter…" },
  { value: "event",   label: "Event name", placeholder: "Search by event name…"        },
  { value: "campus",  label: "Campus",     placeholder: "Choose a campus…"             },
];

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Full-featured events-page search bar ───────────────────────────────────────
function EventsSearchBar() {
  const router = useRouter();
  const [category, setCategory] = useState<SearchCategory>("keyword");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("Within 7 days");
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isTagMode = category === "keyword" || category === "campus";
  const isKeywordMode = category === "keyword";
  const currentPresets = isKeywordMode ? DEFAULT_PRESET_TAGS : CAMPUS_TAGS;
  const active = SEARCH_CATEGORIES.find((c) => c.value === category)!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setTimeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function addTag(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag || selectedTags.includes(tag)) return;
    setSelectedTags((prev) => [...prev, tag]);
  }

  function removeTag(tag: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }

  function togglePreset(tag: string) {
    const normalized = normalizeTag(tag);
    if (selectedTags.includes(normalized)) removeTag(normalized);
    else addTag(tag);
  }

  function timeOptionToDateRange(option: string): { start_after: string; start_before?: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    function addDays(d: Date, n: number): Date {
      const r = new Date(d); r.setDate(r.getDate() + n); return r;
    }
    function nextSaturday(from: Date): Date {
      const day = from.getDay();
      return addDays(from, day === 6 ? 7 : (6 - day + 7) % 7 || 7);
    }
    switch (option) {
      case "This weekend": { const sat = nextSaturday(today); return { start_after: sat.toISOString(), start_before: addDays(sat, 2).toISOString() }; }
      case "Within 7 days": return { start_after: today.toISOString(), start_before: addDays(today, 7).toISOString() };
      case "Next weekend": { const sat = nextSaturday(addDays(today, 7)); return { start_after: sat.toISOString(), start_before: addDays(sat, 2).toISOString() }; }
      case "Within 30 days": return { start_after: today.toISOString(), start_before: addDays(today, 30).toISOString() };
      default: return { start_after: today.toISOString() };
    }
  }

  function doSearch(explicitTags?: string[]) {
    setDropdownOpen(false);
    const { start_after, start_before } = timeOptionToDateRange(selectedTime);
    const params = new URLSearchParams({ category, start_after });
    if (start_before) params.set("start_before", start_before);

    if (isTagMode) {
      const allTags = explicitTags ?? [
        ...selectedTags,
        ...(customInput.trim() ? [normalizeTag(customInput)] : []),
      ];
      if (allTags.length > 0) params.set("tags", allTags.join(","));
    } else {
      const q = searchQuery.trim();
      if (q) params.set("q", q);
    }

    router.push(`/search?${params.toString()}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customInput.trim()) {
        const newTag = normalizeTag(customInput);
        const newTags = selectedTags.includes(newTag)
          ? selectedTags
          : [...selectedTags, newTag];
        setSelectedTags(newTags);
        setCustomInput("");
        doSearch(newTags);
      } else {
        doSearch();
      }
      return;
    }
    if (e.key === ",") {
      e.preventDefault();
      if (customInput.trim()) { addTag(customInput); setCustomInput(""); }
      return;
    }
    if (e.key === "Backspace" && customInput === "" && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  return (
    <div className={styles.eventsSearchWrap} ref={containerRef}>

      {/* ── Search bar ── */}
      <div className={styles.eventsSearchBarWrap}>
        <form
          className={styles.eventsSearchBar}
          onSubmit={handleSubmit}
        >
          {/* Category selector */}
          <select
            className={styles.eventsSearchCategory}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as SearchCategory);
              setDropdownOpen(false);
              setSelectedTags([]);
              setCustomInput("");
              setSearchQuery("");
            }}
            aria-label="Search category"
          >
            {SEARCH_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className={styles.eventsDivider} />

          {isTagMode ? (
            <div
              className={styles.eventsPillArea}
              onClick={() => setDropdownOpen(true)}
            >
              {selectedTags.map((tag) => (
                <span key={tag} className={styles.eventsPill}>
                  <span>#{tag}</span>
                  <button
                    type="button"
                    className={styles.eventsPillRemove}
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    aria-label={`Remove #${tag}`}
                  >✕</button>
                </span>
              ))}
              <input
                className={styles.eventsTagInput}
                type="text"
                placeholder={selectedTags.length === 0 ? active.placeholder : ""}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-label="Filter events by tag"
              />
            </div>
          ) : (
            <input
              className={styles.eventsEventInput}
              type="text"
              placeholder={active.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search by event name"
            />
          )}

          {(selectedTags.length > 0 || searchQuery) && (
            <button
              type="button"
              className={styles.eventsClearBtn}
              onClick={(e) => { e.stopPropagation(); setSelectedTags([]); setCustomInput(""); setSearchQuery(""); }}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}

          <button type="submit" className={styles.eventsSubmitBtn} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Tag/campus dropdown */}
        {isTagMode && dropdownOpen && (
          <div className={styles.eventsDropdown}>
            <p className={styles.eventsDropdownHeading}>
              {isKeywordMode ? "Common tags" : "Campuses"}
            </p>
            <div className={styles.eventsDropdownPresets}>
              {currentPresets.map((tag) => (
                <TagButton
                  key={tag}
                  label={`#${tag}`}
                  selected={selectedTags.includes(normalizeTag(tag))}
                  onClick={() => togglePreset(tag)}
                  accentColor={category === "campus" ? getCampusColor(tag.toLowerCase()) : undefined}
                />
              ))}
            </div>
            {isKeywordMode && (
              <>
                <div className={styles.eventsDropdownDivider}>
                  <span>or add your own</span>
                </div>
                <p className={styles.eventsDropdownHint}>
                  Type a tag in the search bar above and press <kbd>Enter</kbd> to add it.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Time filter ── */}
      <div className={styles.eventsTimeWrap}>
        <button
          type="button"
          className={styles.eventsTimeBtn}
          onClick={() => { setTimeDropdownOpen((p) => !p); setDropdownOpen(false); }}
          aria-label="Filter by time"
        >
          {selectedTime} <ChevronDown />
        </button>
        {timeDropdownOpen && (
          <div className={styles.eventsTimeDropdown}>
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`${styles.eventsTimeOption} ${opt === selectedTime ? styles.eventsTimeOptionActive : ""}`}
                onClick={() => { setSelectedTime(opt); setTimeDropdownOpen(false); }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function EventsPageInner() {
  const { signOut } = useAuth();
  return (
    <AnimatedPageBackground>
      <div className={styles.page}>
        <Navbar
          showAuth={false}
          hideSearch={true}
          logoHref="/personalized-dashboard"
          rightContent={
            <>
              <NotificationButton />
              <ProfileDropdown onSignOut={signOut} />
            </>
          }
        />

        <div className={styles.heroContent}>
          <h1 className={styles.title}>Events to Explore...</h1>
          <Link className={styles.createLink} href="/eventposting">
            + Post your own event
          </Link>
        </div>

        <div className={styles.searchSection}>
          <EventsSearchBar />
        </div>

        <main className={styles.wrap}>
          <div className={styles.grid}>
            {mockEvents.map((e) => (
              <EventCard
                key={e.id}
                title={e.title}
                subTitle={e.subTitle}
                tags={e.tags.map((t) => ({ id: `${e.id}-${t}`, label: `#${t}`, accentColor: getCampusColor(t) }))}
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
    </AnimatedPageBackground>
  );
}

export default function EventsIndexPage() {
  return <EventsPageInner />;
}
