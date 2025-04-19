import { NextRequest, NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getValidSpotifyAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
    }
    
    // Fetch user's playlists from Spotify API
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch playlists: ${response.statusText}` }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Transform the response to include only the data we need
    const playlists = data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images[0]?.url,
      trackCount: playlist.tracks.total,
      owner: playlist.owner.display_name,
    }));
    
    return NextResponse.json({ playlists, total: data.total });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
