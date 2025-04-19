import { NextRequest, NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getValidSpotifyAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
    }
    
    // Get user ID from cookies
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get track data from request body
    const { tracks } = await request.json();
    
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: 'No tracks provided' }, { status: 400 });
    }
    
    // Get database connection
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Save tracks to database
    const savedTracks = [];
    
    for (const track of tracks) {
      const trackId = uuidv4();
      
      await db.prepare(
        `INSERT INTO saved_songs (id, user_id, spotify_id, song_name, artist_name, album_name)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        trackId,
        userId,
        track.id,
        track.name,
        track.artist,
        track.album
      ).run();
      
      savedTracks.push({
        id: trackId,
        spotifyId: track.id,
        name: track.name,
        artist: track.artist,
        album: track.album
      });
    }
    
    return NextResponse.json({ success: true, savedTracks });
  } catch (error) {
    console.error('Error saving tracks:', error);
    return NextResponse.json({ error: 'Failed to save tracks' }, { status: 500 });
  }
}
