import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';

// Interface for Spotify tokens
interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  spotifyUserId: string;
}

// Get Spotify tokens from database
export async function getSpotifyTokens(): Promise<SpotifyTokens | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return null;
    }
    
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    const tokens = await db.prepare(
      `SELECT access_token as accessToken, refresh_token as refreshToken, 
       expires_at as expiresAt, spotify_user_id as spotifyUserId
       FROM spotify_tokens WHERE user_id = ?`
    ).bind(userId).first();
    
    if (!tokens) {
      return null;
    }
    
    return tokens as SpotifyTokens;
  } catch (error) {
    console.error('Error fetching Spotify tokens:', error);
    return null;
  }
}

// Check if tokens are expired and refresh if needed
export async function getValidSpotifyAccessToken(): Promise<string | null> {
  try {
    const tokens = await getSpotifyTokens();
    
    if (!tokens) {
      return null;
    }
    
    // Check if token is expired (with 60 seconds buffer)
    if (Date.now() > tokens.expiresAt - 60000) {
      // Token is expired, refresh it
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      
      if (!newTokens) {
        return null;
      }
      
      return newTokens.accessToken;
    }
    
    // Token is still valid
    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid Spotify access token:', error);
    return null;
  }
}

// Refresh the access token using the refresh token
async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens | null> {
  try {
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    });
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update tokens in database
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return null;
    }
    
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get the existing Spotify user ID
    const existingTokens = await getSpotifyTokens();
    
    if (!existingTokens) {
      return null;
    }
    
    const newTokens: SpotifyTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep the old one
      expiresAt: Date.now() + data.expires_in * 1000,
      spotifyUserId: existingTokens.spotifyUserId,
    };
    
    // Update tokens in database
    await db.prepare(
      `UPDATE spotify_tokens 
       SET access_token = ?, refresh_token = ?, expires_at = ?
       WHERE user_id = ?`
    ).bind(
      newTokens.accessToken,
      newTokens.refreshToken,
      newTokens.expiresAt,
      userId
    ).run();
    
    return newTokens;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}
