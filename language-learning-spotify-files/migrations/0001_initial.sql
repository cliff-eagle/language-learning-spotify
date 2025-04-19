-- Initialize database tables for language learning with Spotify

-- Users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  openai_api_key TEXT,
  native_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  current_level TEXT NOT NULL,
  desired_level TEXT NOT NULL,
  application_context TEXT NOT NULL
);

-- Saved songs table to store user's selected songs for learning
CREATE TABLE IF NOT EXISTS saved_songs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  spotify_id TEXT NOT NULL,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Lyrics table to store processed lyrics for songs
CREATE TABLE IF NOT EXISTS lyrics (
  id TEXT PRIMARY KEY,
  song_id TEXT NOT NULL,
  original_lyrics TEXT,
  transliteration TEXT,
  translation TEXT,
  language TEXT NOT NULL,
  FOREIGN KEY (song_id) REFERENCES saved_songs(id)
);

-- Learning progress table to track user progress with songs
CREATE TABLE IF NOT EXISTS learning_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  last_played TIMESTAMP,
  completion_percentage INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (song_id) REFERENCES saved_songs(id)
);
