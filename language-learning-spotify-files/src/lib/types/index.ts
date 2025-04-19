// User profile types
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: string;
  desiredLevel: string;
  applicationContext: string;
  openaiApiKey: string;
  createdAt: Date;
}

// Language level options
export enum LanguageLevel {
  BEGINNER = "Beginner",
  ELEMENTARY = "Elementary",
  INTERMEDIATE = "Intermediate",
  UPPER_INTERMEDIATE = "Upper Intermediate",
  ADVANCED = "Advanced",
  PROFICIENT = "Proficient",
}

// Application context options
export enum ApplicationContext {
  TOURISM = "Tourism",
  BUSINESS = "Business",
  HEALTHCARE = "Healthcare",
  EDUCATION = "Education",
  DAILY_LIFE = "Daily Life",
  CULTURE = "Culture",
  TECHNICAL = "Technical",
  OTHER = "Other",
}

// Spotify related types
export interface SpotifySong {
  id: string;
  name: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  previewUrl?: string;
}

export interface SavedSong extends SpotifySong {
  userId: string;
  addedAt: Date;
}

// Lyrics related types
export interface ProcessedLyrics {
  id: string;
  songId: string;
  originalLyrics: string[];
  transliteration?: string[];
  translation?: string[];
  language: string;
}

// Learning progress type
export interface LearningProgress {
  id: string;
  userId: string;
  songId: string;
  lastPlayed?: Date;
  completionPercentage: number;
  notes?: string;
}
