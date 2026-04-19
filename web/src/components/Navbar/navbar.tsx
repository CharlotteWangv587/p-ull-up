"use client";

import Link from "next/link";
import { ReactNode, useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./navbar.module.css";
import { ThemeToggle } from "@/components/ThemeToggle/theme-toggle";
import TagButton from "@/components/TagButton/tag-button";
import { DEFAULT_PRESET_TAGS, normalizeTag } from "@/components/TagInput/tag-input";
import { getCampusColor } from "@/lib/campus";

type SearchCategory = "keyword" | "event" | "campus";

const SEARCH_CATEGORIES: { value: SearchCategory; label: string; placeholder: string }[] = [
  { value: "keyword", label: "Keyword",    placeholder: "Type a tag and press Enter…" },
  { value: "event",   label: "Event name", placeholder: "Search by event name…"        },
  { value: "campus",  label: "Campus",     placeholder: "Choose a campus…"             },
];

export const CAMPUS_TAGS = ["Pomona", "CMC", "Pitzer", "Scripps", "HMC", "All 5Cs"];

export const TIME_OPTIONS = [
  "This weekend",
  "Within 7 days",
  "Next weekend",
  "Within 30 days",
  "All upcoming",
];

function ChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type NavbarProps = {
  showAuth?: boolean;
  rightContent?: ReactNode;
  logoHref?: string;
  hideSearch?: boolean;
};

export default function Navbar({
  showAuth = true,
  rightContent,
  logoHref = "/",
  hideSearch = false,
}: NavbarProps) {
  const router = useRouter();
  const [category, setCategory] = useState<SearchCategory>("keyword");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("Within 7 days");
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isTagMode = category === "keyword" || category === "campus";
  const isKeywordMode = category === "keyword";
  const currentPresets = isKeywordMode ? DEFAULT_PRESET_TAGS : CAMPUS_TAGS;
  const active = SEARCH_CATEGORIES.find((c) => c.value === category)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
        setTimeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  function handleCustomTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (customTagInput.trim()) {
        addTag(customTagInput);
        setCustomTagInput("");
      }
    }
    if (e.key === "Backspace" && customTagInput === "" && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setTagDropdownOpen(false);
    if (isTagMode) {
      const allTags = [...selectedTags];
      if (customTagInput.trim()) allTags.push(normalizeTag(customTagInput));
      if (allTags.length > 0) {
        router.push(`/search?tags=${encodeURIComponent(allTags.join(","))}&category=${category}`);
      }
    } else {
      const q = searchQuery.trim();
      if (!q) return;
      router.push(`/search?q=${encodeURIComponent(q)}&category=${category}`);
    }
  }

  return (
    <nav className={styles.navbar}>
      {/* LEFT GROUP: Logo + Search */}
      <div className={styles.navLeft}>
        <Link href={logoHref} className={styles.logo} aria-label="Go to home page">
          p-ull up
        </Link>

        {!hideSearch && (
          <div className={styles.searchContainer} ref={searchContainerRef}>

            {/* ── Search form wrapper (position:relative for dropdown) ── */}
            <div className={styles.searchFormWrap}>
              <form className={styles.searchWrapper} onSubmit={handleSearch} role="search">
                <select
                  className={styles.searchCategory}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as SearchCategory);
                    setTagDropdownOpen(false);
                    setSelectedTags([]);
                    setCustomTagInput("");
                    setSearchQuery("");
                  }}
                  aria-label="Search category"
                >
                  {SEARCH_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                <div className={styles.divider} />

                {isTagMode ? (
                  <div className={styles.tagPillArea} onClick={() => setTagDropdownOpen(true)}>
                    {selectedTags.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        <span>#{tag}</span>
                        <button
                          type="button"
                          className={styles.tagPillRemove}
                          onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                          aria-label={`Remove #${tag}`}
                        >✕</button>
                      </span>
                    ))}
                    <input
                      className={styles.tagSearchInput}
                      type="text"
                      placeholder={selectedTags.length === 0 ? active.placeholder : ""}
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onFocus={() => setTagDropdownOpen(true)}
                      onKeyDown={handleCustomTagKeyDown}
                      aria-label="Search by tags"
                      autoComplete="off"
                    />
                  </div>
                ) : (
                  <div className={styles.searchSection}>
                    <input
                      type="text"
                      placeholder={active.placeholder}
                      className={styles.searchInput}
                      aria-label={`Search by ${active.label}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className={styles.searchIconBtn} aria-label="Search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>

              {/* ── Tag / campus dropdown ── */}
              {isTagMode && tagDropdownOpen && (
                <div className={styles.tagDropdown}>
                  <p className={styles.tagDropdownHeading}>
                    {isKeywordMode ? "Common tags" : "Campuses"}
                  </p>
                  <div className={styles.tagDropdownPresets}>
                    {currentPresets.map((tag) => (
                      <TagButton
                        key={tag}
                        label={`#${tag}`}
                        selected={selectedTags.includes(normalizeTag(tag))}
                        onClick={() => togglePreset(tag)}
                        size="sm"
                        accentColor={category === "campus" ? getCampusColor(tag.toLowerCase()) : undefined}
                      />
                    ))}
                  </div>
                  {isKeywordMode && (
                    <>
                      <div className={styles.tagDropdownDivider}>
                        <span>or add your own</span>
                      </div>
                      <p className={styles.tagDropdownHint}>
                        Type a tag in the search bar above and press <kbd>Enter</kbd> to add it.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Time filter button ── */}
            <div className={styles.timeFilterWrap}>
              <button
                type="button"
                className={styles.timeFilterBtn}
                onClick={() => {
                  setTimeDropdownOpen((p) => !p);
                  setTagDropdownOpen(false);
                }}
                aria-label="Filter by time"
              >
                {selectedTime} <ChevronDown />
              </button>
              {timeDropdownOpen && (
                <div className={styles.timeDropdown}>
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.timeOption} ${opt === selectedTime ? styles.timeOptionActive : ""}`}
                      onClick={() => { setSelectedTime(opt); setTimeDropdownOpen(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* RIGHT GROUP */}
      {showAuth ? (
        <div className={styles.navRight}>
          <ThemeToggle />
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/signUp">
            <button className={styles.signUpBtn}>Create Account</button>
          </Link>
        </div>
      ) : (
        <div className={styles.navRight}>
          <ThemeToggle />
          {rightContent}
        </div>
      )}
    </nav>
  );
}
