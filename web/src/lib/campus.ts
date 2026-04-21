/**
 * 5C college colors + helpers.
 * Colors based on each college's official brand palette.
 */

/** Display names of campus tags (proper-cased) */
export const CAMPUS_TAGS = ["Pomona", "CMC", "Pitzer", "Scripps", "HMC", "All 5Cs"];

/**
 * Map from normalized (lowercase) campus tag → accent color.
 *
 * Pomona  — Royal Blue  (#003087)
 * CMC     — Crimson     (#8B1538)
 * Pitzer  — Burnt Orange (#CC4F1C)
 * Scripps — Forest Green (#0B5E2A)
 * HMC     — Deep Gold   (#B07B00)
 * All 5Cs — Consortium Indigo (#2D1B69)
 */
export const CAMPUS_COLOR_MAP: Record<string, string> = {
  pomona:    "#003087",
  cmc:       "#8B1538",
  pitzer:    "#CC4F1C",
  scripps:   "#0B5E2A",
  hmc:       "#B07B00",
  "all 5cs": "#2D1B69",
};

/** Returns the accent color for a normalized campus tag, or undefined if not a campus tag */
export function getCampusColor(normalizedTag: string): string | undefined {
  return CAMPUS_COLOR_MAP[normalizedTag.toLowerCase()];
}
