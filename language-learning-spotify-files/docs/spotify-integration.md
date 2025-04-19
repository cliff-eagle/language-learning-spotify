# Spotify API Integration

To integrate Spotify into our application, we need to:

1. Register our application with Spotify Developer Dashboard
2. Implement OAuth 2.0 authentication flow
3. Create API endpoints for Spotify interaction
4. Build UI components for song/playlist selection

## Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Set redirect URI to: `http://localhost:3000/api/auth/spotify/callback`
4. Note down Client ID and Client Secret

## Environment Variables

We'll need to store these credentials securely in environment variables:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

## Authentication Flow

We'll implement the OAuth 2.0 authorization code flow:
1. Redirect user to Spotify login
2. User authorizes our app
3. Spotify redirects back with authorization code
4. Exchange code for access token
5. Use access token for API requests

## Required Scopes

- `user-read-private` - Read user's subscription details
- `user-read-email` - Read user's email address
- `user-library-read` - Access user's saved tracks
- `playlist-read-private` - Access user's private playlists
- `playlist-read-collaborative` - Access user's collaborative playlists

## API Endpoints

We'll create these endpoints:
- `/api/spotify/login` - Initiate Spotify login
- `/api/auth/spotify/callback` - Handle Spotify redirect
- `/api/spotify/playlists` - Get user's playlists
- `/api/spotify/tracks` - Get tracks from playlist
- `/api/spotify/save` - Save selected tracks for learning

## UI Components

- Spotify login button
- Playlist browser
- Track selector
- Selected tracks list
