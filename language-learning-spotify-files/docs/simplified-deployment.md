# Language Learning with Spotify - Deployment Steps

This document provides a simplified step-by-step guide to deploy the Language Learning with Spotify application.

## Step 1: Prepare Your Environment

1. Make sure you have:
   - A computer with Node.js installed (version 18 or higher)
   - Basic knowledge of command line operations
   - A Spotify Developer account
   - A Musixmatch API key
   - An OpenAI API key

## Step 2: Get API Keys

1. **Spotify API Keys**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new app
   - Note down the Client ID and Client Secret
   - Add `http://localhost:3000/api/auth/spotify/callback` as a Redirect URI

2. **Musixmatch API Key**:
   - Go to [Musixmatch Developer](https://developer.musixmatch.com/)
   - Sign up for an account
   - Get your API key

3. **OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Navigate to API keys section
   - Create a new API key

## Step 3: Deploy the Application

### Option A: Deploy to Cloudflare Pages (Easiest)

1. Create a Cloudflare account if you don't have one
2. Install Wrangler CLI: `npm install -g wrangler`
3. Log in to Cloudflare: `wrangler login`
4. Navigate to the project directory
5. Build the application: `pnpm build`
6. Deploy to Cloudflare: `wrangler pages deploy .next`
7. Set up environment variables in the Cloudflare dashboard:
   - SPOTIFY_CLIENT_ID
   - SPOTIFY_CLIENT_SECRET
   - SPOTIFY_REDIRECT_URI (update with your Cloudflare domain)
   - MUSIXMATCH_API_KEY

### Option B: Run Locally (For Testing)

1. Navigate to the project directory
2. Create a `.env` file with your API keys:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
   MUSIXMATCH_API_KEY=your_musixmatch_api_key
   ```
3. Install dependencies: `pnpm install`
4. Set up the database: `pnpm wrangler d1 execute DB --local --file=migrations/0001_initial.sql`
5. Run the development server: `pnpm dev`
6. Access the application at http://localhost:3000

## Step 4: Access Your Website

- If you deployed to Cloudflare, your website will be available at the URL provided after deployment (something like https://language-learning-spotify.pages.dev)
- If you're running locally, access it at http://localhost:3000

## Step 5: Update Spotify Redirect URI

- After deployment, go back to your Spotify Developer Dashboard
- Update the Redirect URI to match your deployed website URL
- Format: https://your-domain.com/api/auth/spotify/callback

That's it! Your Language Learning with Spotify application should now be accessible online.
