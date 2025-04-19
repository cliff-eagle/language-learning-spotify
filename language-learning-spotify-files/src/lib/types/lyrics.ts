// Types for lyrics processing
export interface LyricsResponse {
  lyrics: string;
  language: string;
  trackId: string;
  trackName: string;
  artistName: string;
}

export interface ProcessedLyricsLine {
  original: string;
  transliteration?: string;
  translation?: string;
  timestamp?: number;
}

export interface ProcessedLyrics {
  lines: ProcessedLyricsLine[];
  language: string;
  trackId: string;
  trackName: string;
  artistName: string;
}

// Supported scripts for transliteration
export enum Script {
  LATIN = "latin",
  CYRILLIC = "cyrillic",
  PERSO_ARABIC = "perso-arabic"
}

// Language to script mapping
export const languageToScripts: Record<string, Script[]> = {
  // Languages using Latin script
  "english": [Script.LATIN],
  "spanish": [Script.LATIN],
  "french": [Script.LATIN],
  "german": [Script.LATIN],
  "italian": [Script.LATIN],
  "portuguese": [Script.LATIN],
  
  // Languages using Cyrillic script
  "russian": [Script.CYRILLIC, Script.LATIN],
  "ukrainian": [Script.CYRILLIC, Script.LATIN],
  "bulgarian": [Script.CYRILLIC, Script.LATIN],
  "serbian": [Script.CYRILLIC, Script.LATIN],
  
  // Languages using Perso-Arabic script
  "arabic": [Script.PERSO_ARABIC, Script.LATIN],
  "persian": [Script.PERSO_ARABIC, Script.LATIN],
  "urdu": [Script.PERSO_ARABIC, Script.LATIN],
  
  // Languages with other scripts that can be transliterated
  "japanese": [Script.LATIN],
  "chinese": [Script.LATIN],
  "korean": [Script.LATIN],
  "thai": [Script.LATIN],
  "hindi": [Script.LATIN],
};

// Color palette for matching original, transliteration, and translation
export const colorPalette = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];
