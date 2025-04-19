import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Spotify API scopes needed for our application
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ');

export async function GET(request: NextRequest) {
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in cookie for verification when Spotify redirects back
  const response = NextResponse.redirect(getSpotifyAuthUrl(state));
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });
  
  return response;
}

function getSpotifyAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    state: state
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
