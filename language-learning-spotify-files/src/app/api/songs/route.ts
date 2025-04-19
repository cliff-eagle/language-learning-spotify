import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';
import { SavedSong } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get database connection
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get saved songs from database
    const songs = await db.prepare(
      `SELECT id, spotify_id as spotifyId, song_name as name, artist_name as artist, album_name as album, added_at as addedAt
       FROM saved_songs WHERE user_id = ? ORDER BY added_at DESC`
    ).bind(userId).all();
    
    return NextResponse.json({ songs: songs.results });
  } catch (error) {
    console.error('Error fetching saved songs:', error);
    return NextResponse.json({ error: 'Failed to fetch saved songs' }, { status: 500 });
  }
}
