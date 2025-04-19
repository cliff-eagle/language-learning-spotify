import { NextRequest, NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getValidSpotifyAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
    }
    
    // Get playlist ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const playlistId = searchParams.get('playlistId');
    
    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }
    
    // Fetch tracks from the specified playlist
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch tracks: ${response.statusText}` }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Transform the response to include only the data we need
    const tracks = data.items.map((item: any) => {
      const track = item.track;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(', '),
        album: track.album.name,
        imageUrl: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        durationMs: track.duration_ms,
        explicit: track.explicit,
      };
    });
    
    return NextResponse.json({ tracks, total: data.total });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
