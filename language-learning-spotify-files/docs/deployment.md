# Language Learning with Spotify - Deployment Guide

This document outlines the steps to deploy the Language Learning with Spotify application.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Spotify Developer account with registered application
- Musixmatch API key
- Environment variables properly configured

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Spotify API credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/auth/spotify/callback

# Musixmatch API
MUSIXMATCH_API_KEY=your_musixmatch_api_key

# Database configuration (if using external database)
# Uncomment and configure as needed
# DATABASE_URL=your_database_connection_string
```

## Local Development

1. Install dependencies:
```bash
cd language-learning-spotify
pnpm install
```

2. Set up the database:
```bash
pnpm wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

3. Run the development server:
```bash
pnpm dev
```

4. Access the application at http://localhost:3000

## Production Deployment

### Option 1: Deploy to Cloudflare Pages

1. Build the application:
```bash
pnpm build
```

2. Deploy using Wrangler:
```bash
pnpm wrangler pages deploy .next
```

3. Configure environment variables in the Cloudflare dashboard

### Option 2: Deploy as a Static Website

1. Build the application:
```bash
pnpm build
pnpm export
```

2. Deploy the `out` directory to any static hosting service

## Post-Deployment Steps

1. Update the Spotify Developer Dashboard with the new redirect URI
2. Test the authentication flow in the production environment
3. Verify that all features are working correctly

## Troubleshooting

- If you encounter CORS issues, ensure your Spotify Developer Dashboard has the correct redirect URIs
- For database connection issues, check that your D1 database is properly configured
- If lyrics aren't loading, verify your Musixmatch API key is valid and has sufficient quota
