import { NextRequest, NextResponse } from 'next/server';
import { fetchLyrics, processLyrics, generateTransliteration, generateTranslation } from '@/lib/lyrics';
import { Script } from '@/lib/types/lyrics';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function GET(request: NextRequest) {
  try {
    // Get song ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const songId = searchParams.get('songId');
    
    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }
    
    // Get user ID from cookies
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get database connection
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get song details from database
    const song = await db.prepare(
      `SELECT spotify_id FROM saved_songs WHERE id = ? AND user_id = ?`
    ).bind(songId, userId).first();
    
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    
    // Fetch lyrics from Musixmatch
    const lyricsResponse = await fetchLyrics(song.spotify_id);
    
    if (!lyricsResponse) {
      return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
    }
    
    // Process lyrics into structured format
    const processedLyrics = processLyrics(lyricsResponse);
    
    return NextResponse.json(processedLyrics);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
