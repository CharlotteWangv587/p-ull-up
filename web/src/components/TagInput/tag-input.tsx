"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import TagButton from "@/components/TagButton/tag-button";
import styles from "./tag-input.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagInputProps = {
  /** Current selected tags — fully controlled */
  value: string[];
  onChange: (tags: string[]) => void;
  /**
   * Fixed list shown as toggleable preset chips.
   * Defaults to the standard p-ull-up tag set.
   */
  presetTags?: string[];
  /**
   * Maximum number of custom (user-typed) tags allowed.
   * Backend note: this limit is also enforced server-side on submit.
   */
  maxCustomTags?: number;
  /** Maximum characters per custom tag */
  maxTagLength?: number;
  /** Forwarded to the hidden <input> for form serialisation */
  name?: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PRESET_TAGS = [
  "on campus",
  "off campus",
  "party",
  "outdoors",
  "indoors",
  "departmental",
  "club",
  "organization",
  "food",
  "music",
  "sports",
  "other",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise a raw tag string into the canonical form used for storage and
 * search.  Backend search should apply the same transformation before
 * matching so that "Party", " #Party ", and "party" all resolve to "party".
 */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")   // strip leading #
    .replace(/\s+/g, " ") // collapse internal whitespace
    .trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TagInput({
  value,
  onChange,
  presetTags = DEFAULT_PRESET_TAGS,
  maxCustomTags = 10,
  maxTagLength = 30,
  name,
}: TagInputProps) {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tags that are NOT in the preset list — i.e. user-created ones
  const customTags = value.filter((t) => !presetTags.includes(t));

  function commit(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag) return;

    if (tag.length > maxTagLength) {
      setError(`Tags can be at most ${maxTagLength} characters.`);
      return;
    }
    if (value.includes(tag)) {
      setError(`"#${tag}" is already added.`);
      return;
    }
    if (customTags.length >= maxCustomTags) {
      setError(`You can add up to ${maxCustomTags} custom tags.`);
      return;
    }

    setError(null);
    onChange([...value, tag]);
    setInputText("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function togglePreset(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(inputText);
    }
    // Backspace on empty input removes the last custom tag
    if (e.key === "Backspace" && inputText === "" && customTags.length > 0) {
      removeTag(customTags[customTags.length - 1]);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",")) {
      e.preventDefault();
      pasted.split(",").forEach((chunk) => commit(chunk));
    }
    // Otherwise fall through to normal paste
  }

  return (
    <div className={styles.root}>
      {/* ── Preset tags ───────────────────────────────────────────────── */}
      <div className={styles.presetRow} role="group" aria-label="Preset tags">
        {presetTags.map((t) => (
          <TagButton
            key={t}
            label={`#${t}`}
            selected={value.includes(t)}
            onClick={() => togglePreset(t)}
            ariaLabel={value.includes(t) ? `Remove #${t}` : `Add #${t}`}
          />
        ))}
      </div>

      {/* ── Divider with label ─────────────────────────────────────────── */}
      <div className={styles.divider}>
        <span className={styles.dividerLabel}>or add your own</span>
      </div>

      {/* ── Custom tag input pill row ─────────────────────────────────── */}
      {/* Clicking anywhere in this box focuses the text input */}
      <div
        className={styles.customBox}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label="Custom tags"
      >
        {customTags.map((t) => (
          <span key={t} className={styles.customChip}>
            <span className={styles.chipLabel}>#{t}</span>
            <button
              type="button"
              className={styles.chipRemove}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(t);
              }}
              aria-label={`Remove #${t}`}
            >
              ✕
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className={styles.customInput}
          type="text"
          placeholder={customTags.length === 0 ? "Type a tag and press Enter…" : ""}
          value={inputText}
          onChange={(e) => {
            setError(null);
            setInputText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputText.trim()) commit(inputText);
          }}
          maxLength={maxTagLength + 1} // +1 so the error fires before they can type more
          aria-label="Add a custom tag"
          aria-describedby={error ? "tag-input-error" : undefined}
        />
      </div>

      {error ? (
        <p id="tag-input-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.hint}>
          Press <kbd>Enter</kbd> or <kbd>,</kbd> to add · separate multiple with commas
        </p>
      )}

      {/*
        Hidden serialised value for plain HTML form submissions.
        When wiring to the backend, read `value` (the prop) directly instead —
        it's the canonical string[] you pass to your API as the `tags` field.
        The backend can then index these for GET /api/events?tags=party,food
      */}
      {name ? (
        <input type="hidden" name={name} value={value.join(",")} />
      ) : null}
    </div>
  );
}
