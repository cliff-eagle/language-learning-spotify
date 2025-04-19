import { ProcessedLyrics, ProcessedLyricsLine, LyricsResponse, Script } from './types/lyrics';
import { getUserProfile } from './auth';
import { getValidSpotifyAccessToken } from './spotify';

/**
 * Fetch lyrics for a song using web scraping approach (no API key required)
 */
export async function fetchLyrics(spotifyTrackId: string): Promise<LyricsResponse | null> {
  try {
    // Get track info from Spotify
    const trackInfo = await getTrackInfoFromSpotify(spotifyTrackId);
    
    if (!trackInfo) {
      throw new Error('Failed to get track info from Spotify');
    }
    
    // Format search query for lyrics
    const searchQuery = encodeURIComponent(`${trackInfo.name} ${trackInfo.artist} lyrics`);
    
    // First try Musixmatch (without API)
    try {
      const lyrics = await scrapeMusixmatchLyrics(trackInfo.name, trackInfo.artist);
      
      if (lyrics) {
        return {
          lyrics,
          language: detectLanguage(lyrics),
          trackId: spotifyTrackId,
          trackName: trackInfo.name,
          artistName: trackInfo.artist,
        };
      }
    } catch (error) {
      console.log('Failed to scrape from Musixmatch, trying alternative sources...');
    }
    
    // Try AZLyrics as fallback
    try {
      const lyrics = await scrapeAZLyrics(trackInfo.name, trackInfo.artist);
      
      if (lyrics) {
        return {
          lyrics,
          language: detectLanguage(lyrics),
          trackId: spotifyTrackId,
          trackName: trackInfo.name,
          artistName: trackInfo.artist,
        };
      }
    } catch (error) {
      console.log('Failed to scrape from AZLyrics, trying next source...');
    }
    
    // Try Genius as another fallback
    try {
      const lyrics = await scrapeGeniusLyrics(trackInfo.name, trackInfo.artist);
      
      if (lyrics) {
        return {
          lyrics,
          language: detectLanguage(lyrics),
          trackId: spotifyTrackId,
          trackName: trackInfo.name,
          artistName: trackInfo.artist,
        };
      }
    } catch (error) {
      console.log('Failed to scrape from Genius');
    }
    
    throw new Error('Could not find lyrics from any source');
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}

/**
 * Scrape lyrics from Musixmatch without using API
 */
async function scrapeMusixmatchLyrics(songName: string, artistName: string): Promise<string | null> {
  try {
    // Format the search query
    const formattedSongName = songName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]/g, '');
    const formattedArtistName = artistName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s-]/g, '');
    
    // Try direct URL format first (most reliable)
    const directUrl = `https://www.musixmatch.com/lyrics/${formattedArtistName}/${formattedSongName}`;
    
    // Fetch the page
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      // If direct URL fails, try search
      const searchUrl = `https://www.musixmatch.com/search/${encodeURIComponent(songName + ' ' + artistName)}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      if (!searchResponse.ok) {
        return null;
      }
      
      const searchHtml = await searchResponse.text();
      
      // Extract the first result URL
      const resultUrlMatch = searchHtml.match(/href="(\/lyrics\/[^"]+)"/);
      if (!resultUrlMatch) {
        return null;
      }
      
      // Fetch the lyrics page
      const lyricsUrl = `https://www.musixmatch.com${resultUrlMatch[1]}`;
      const lyricsResponse = await fetch(lyricsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      if (!lyricsResponse.ok) {
        return null;
      }
      
      const lyricsHtml = await lyricsResponse.text();
      return extractMusixmatchLyrics(lyricsHtml);
    }
    
    const html = await response.text();
    return extractMusixmatchLyrics(html);
  } catch (error) {
    console.error('Error scraping Musixmatch:', error);
    return null;
  }
}

/**
 * Extract lyrics from Musixmatch HTML
 */
function extractMusixmatchLyrics(html: string): string | null {
  // Look for the lyrics content div
  const lyricsMatch = html.match(/<div class="mxm-lyrics"><span class="lyrics__content__ok">([\s\S]*?)<\/span><\/div>/);
  
  if (!lyricsMatch) {
    // Try alternative pattern
    const altMatch = html.match(/<p class="mxm-lyrics__content "([\s\S]*?)<\/p>/);
    if (!altMatch) {
      return null;
    }
    return cleanLyrics(altMatch[1]);
  }
  
  return cleanLyrics(lyricsMatch[1]);
}

/**
 * Scrape lyrics from AZLyrics
 */
async function scrapeAZLyrics(songName: string, artistName: string): Promise<string | null> {
  try {
    // Format the search query for AZLyrics
    const formattedArtist = artistName.toLowerCase().replace(/\s+/g, '').replace(/[^\w\s]/g, '');
    const formattedSong = songName.toLowerCase().replace(/\s+/g, '').replace(/[^\w\s]/g, '');
    
    // AZLyrics URL format
    const url = `https://www.azlyrics.com/lyrics/${formattedArtist}/${formattedSong}.html`;
    
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract lyrics - AZLyrics has a specific div format
    const lyricsMatch = html.match(/<!-- Usage of azlyrics.com content by any third-party lyrics provider is prohibited by our licensing agreement. Sorry about that. -->([\s\S]*?)<\/div>/);
    
    if (!lyricsMatch) {
      return null;
    }
    
    return cleanLyrics(lyricsMatch[1]);
  } catch (error) {
    console.error('Error scraping AZLyrics:', error);
    return null;
  }
}

/**
 * Scrape lyrics from Genius
 */
async function scrapeGeniusLyrics(songName: string, artistName: string): Promise<string | null> {
  try {
    // Search for the song on Genius
    const searchQuery = encodeURIComponent(`${songName} ${artistName}`);
    const searchUrl = `https://genius.com/api/search/song?q=${searchQuery}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!searchResponse.ok) {
      return null;
    }
    
    const searchData = await searchResponse.json();
    
    // Get the first result
    const firstHit = searchData.response.sections[0].hits[0];
    
    if (!firstHit) {
      return null;
    }
    
    // Get the song URL
    const songUrl = firstHit.result.url;
    
    // Fetch the song page
    const songResponse = await fetch(songUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!songResponse.ok) {
      return null;
    }
    
    const html = await songResponse.text();
    
    // Extract lyrics - Genius has a specific div with data-lyrics-container attribute
    const lyricsMatch = html.match(/<div data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/);
    
    if (!lyricsMatch) {
      return null;
    }
    
    return cleanLyrics(lyricsMatch[1]);
  } catch (error) {
    console.error('Error scraping Genius:', error);
    return null;
  }
}

/**
 * Clean up lyrics text
 */
function cleanLyrics(lyrics: string): string {
  return lyrics
    .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim();
}

/**
 * Simple language detection based on character sets
 * For more accurate detection, you could use a library like franc or langdetect
 */
function detectLanguage(text: string): string {
  // This is a very simplified detection
  // For production, use a proper language detection library
  
  // Check for Cyrillic characters (Russian, Ukrainian, etc.)
  if (/[\u0400-\u04FF]/.test(text)) {
    return 'russian'; // Simplified, could be other Cyrillic languages
  }
  
  // Check for CJK characters (Chinese, Japanese, Korean)
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text)) {
    return 'japanese'; // Simplified, could be Chinese or Korean
  }
  
  // Check for Arabic script
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'arabic';
  }
  
  // Default to English or use more sophisticated detection
  return 'english';
}

/**
 * Get track information from Spotify API
 */
async function getTrackInfoFromSpotify(trackId: string) {
  try {
    // Get valid Spotify access token
    const accessToken = await getValidSpotifyAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated with Spotify');
    }
    
    // Fetch track details from Spotify
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch track info: ${response.statusText}`);
    }
    
    const track = await response.json();
    
    return {
      name: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
    };
  } catch (error) {
    console.error('Error getting track info from Spotify:', error);
    return null;
  }
}

/**
 * Process raw lyrics into structured format with line-by-line breakdown
 */
export function processLyrics(lyricsResponse: LyricsResponse): ProcessedLyrics {
  // Split lyrics into lines
  const rawLines = lyricsResponse.lyrics.split('\n');
  
  // Filter out empty lines and disclaimers
  const filteredLines = rawLines
    .filter(line => line.trim() !== '')
    .filter(line => !line.includes('This Lyrics is NOT for Commercial use'))
    .filter(line => !line.includes('Lyrics provided by'));
  
  // Create processed lyrics lines
  const lines: ProcessedLyricsLine[] = filteredLines.map(line => ({
    original: line.trim(),
  }));
  
  return {
    lines,
    language: lyricsResponse.language,
    trackId: lyricsResponse.trackId,
    trackName: lyricsResponse.trackName,
    artistName: lyricsResponse.artistName,
  };
}

/**
 * Generate transliteration for lyrics using OpenAI API
 */
export async function generateTransliteration(
  processedLyrics: ProcessedLyrics,
  targetScript: Script
): Promise<ProcessedLyrics> {
  try {
    // Get user profile to access OpenAI API key
    const userProfile = await getUserProfile();
    
    if (!userProfile || !userProfile.openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    // Create a copy of the processed lyrics
    const updatedLyrics: ProcessedLyrics = {
      ...processedLyrics,
      lines: [...processedLyrics.lines],
    };
    
    // Prepare the original lyrics for the API request
    const originalLines = processedLyrics.lines.map(line => line.original);
    
    // Create the prompt for OpenAI API
    const prompt = `
      Transliterate the following lyrics from ${processedLyrics.language} to ${targetScript} script.
      Return only the transliterated text, one line at a time, in the same order as the original.
      
      Original lyrics:
      ${originalLines.join('\n')}
    `;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userProfile.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a language expert specializing in transliteration from ${processedLyrics.language} to ${targetScript} script.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const transliteratedText = data.choices[0].message.content.trim();
    
    // Split the transliterated text into lines
    const transliteratedLines = transliteratedText.split('\n');
    
    // Update the processed lyrics with transliterations
    for (let i = 0; i < Math.min(updatedLyrics.lines.length, transliteratedLines.length); i++) {
      updatedLyrics.lines[i].transliteration = transliteratedLines[i].trim();
    }
    
    return updatedLyrics;
  } catch (error) {
    console.error('Error generating transliteration:', error);
    return processedLyrics; // Return original lyrics if transliteration fails
  }
}

/**
 * Generate translation for lyrics using OpenAI API
 */
export async function generateTranslation(
  processedLyrics: ProcessedLyrics,
  targetLanguage: string
): Promise<ProcessedLyrics> {
  try {
    // Get user profile to access OpenAI API key
    const userProfile = await getUserProfile();
    
    if (!userProfile || !userProfile.openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    // Create a copy of the processed lyrics
    const updatedLyrics: ProcessedLyrics = {
      ...processedLyrics,
      lines: [...processedLyrics.lines],
    };
    
    // Prepare the original lyrics for the API request
    const originalLines = processedLyrics.lines.map(line => line.original);
    
    // Create the prompt for OpenAI API
    const prompt = `
      Translate the following lyrics from ${processedLyrics.language} to ${targetLanguage}.
      Return only the translated text, one line at a time, in the same order as the original.
      
      Original lyrics:
      ${originalLines.join('\n')}
    `;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userProfile.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a language expert specializing in translation from ${processedLyrics.language} to ${targetLanguage}.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();
    
    // Split the translated text into lines
    const translatedLines = translatedText.split('\n');
    
    // Update the processed lyrics with translations
    for (let i = 0; i < Math.min(updatedLyrics.lines.length, translatedLines.length); i++) {
      updatedLyrics.lines[i].translation = translatedLines[i].trim();
    }
    
    return updatedLyrics;
  } catch (error) {
    console.error('Error generating translation:', error);
    return processedLyrics; // Return original lyrics if translation fails
  }
}

/**
 * Assign colors to lyrics lines for matching original, transliteration, and translation
 */
export function assignColorsToLyrics(processedLyrics: ProcessedLyrics): Record<number, string> {
  const lineColors: Record<number, string> = {};
  const { colorPalette } = require('./types/lyrics');
  
  // Assign a color to each line
  for (let i = 0; i < processedLyrics.lines.length; i++) {
    // Use modulo to cycle through the color palette
    const colorIndex = i % colorPalette.length;
    lineColors[i] = colorPalette[colorIndex];
  }
  
  return lineColors;
}
