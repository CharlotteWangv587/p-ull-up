"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import TagButton from "@/components/TagButton/tag-button";
import { DEFAULT_PRESET_TAGS, normalizeTag } from "@/components/TagInput/tag-input";
import { CAMPUS_TAGS } from "@/components/Navbar/navbar";
import { getCampusColor } from "@/lib/campus";
import styles from "./events-search-bar.module.css";

type SearchCategory = "keyword" | "event" | "campus";

const SEARCH_CATEGORIES: { value: SearchCategory; label: string; placeholder: string }[] = [
  { value: "keyword", label: "Keyword",    placeholder: "Type a tag and press Enter…" },
  { value: "event",   label: "Event name", placeholder: "Search by event name…"        },
  { value: "campus",  label: "Campus",     placeholder: "Choose a campus…"             },
];

type Props = {
  initialCategory?: SearchCategory;
  initialTags?: string[];
  initialQuery?: string;
};

export default function EventsSearchBar({
  initialCategory = "keyword",
  initialTags = [],
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<SearchCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [customInput, setCustomInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isTagMode = category === "keyword" || category === "campus";
  const isKeywordMode = category === "keyword";
  const currentPresets = isKeywordMode ? DEFAULT_PRESET_TAGS : CAMPUS_TAGS;
  const active = SEARCH_CATEGORIES.find((c) => c.value === category)!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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

  function doSearch(explicitTags?: string[]) {
    setDropdownOpen(false);
    const params = new URLSearchParams({ category });

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
    <div className={styles.eventsSearchBarWrap} ref={containerRef}>
      <form className={styles.eventsSearchBar} onSubmit={handleSubmit}>
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
          <div className={styles.eventsPillArea} onClick={() => setDropdownOpen(true)}>
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
  );
}
