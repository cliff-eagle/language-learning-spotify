import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function GET(request: NextRequest) {
  // Get URL parameters
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Check for errors from Spotify
  if (error) {
    return NextResponse.redirect(new URL('/spotify-connect?error=' + error, request.url));
  }
  
  // Verify state parameter to prevent CSRF attacks
  const cookieStore = cookies();
  const storedState = cookieStore.get('spotify_auth_state')?.value;
  
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/spotify-connect?error=state_mismatch', request.url));
  }
  
  // Exchange authorization code for access token
  if (code) {
    try {
      const tokenResponse = await exchangeCodeForToken(code);
      
      if (!tokenResponse.access_token) {
        return NextResponse.redirect(new URL('/spotify-connect?error=token_error', request.url));
      }
      
      // Get user ID from cookies
      const userId = cookieStore.get('userId')?.value;
      
      if (!userId) {
        return NextResponse.redirect(new URL('/register?error=not_logged_in', request.url));
      }
      
      // Store Spotify tokens in database
      const { env: cfEnv } = getCloudflareContext();
      const db = cfEnv.DB;
      
      // Get Spotify user profile to store Spotify user ID
      const spotifyUser = await fetchSpotifyUserProfile(tokenResponse.access_token);
      
      // Store tokens in database
      await db.prepare(
        `INSERT INTO spotify_tokens (user_id, spotify_user_id, access_token, refresh_token, expires_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
         spotify_user_id = excluded.spotify_user_id,
         access_token = excluded.access_token,
         refresh_token = excluded.refresh_token,
         expires_at = excluded.expires_at`
      ).bind(
        userId,
        spotifyUser.id,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        Date.now() + tokenResponse.expires_in * 1000
      ).run();
      
      // Redirect to song selection page
      return NextResponse.redirect(new URL('/spotify-songs', request.url));
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return NextResponse.redirect(new URL('/spotify-connect?error=token_exchange_failed', request.url));
    }
  }
  
  // If we get here, something went wrong
  return NextResponse.redirect(new URL('/spotify-connect?error=missing_code', request.url));
}

async function exchangeCodeForToken(code: string) {
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    client_id: env.SPOTIFY_CLIENT_ID,
    client_secret: env.SPOTIFY_CLIENT_SECRET,
  });
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchSpotifyUserProfile(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify user profile: ${response.statusText}`);
  }
  
  return await response.json();
}
