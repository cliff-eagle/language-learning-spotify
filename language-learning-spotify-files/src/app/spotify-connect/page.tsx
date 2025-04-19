'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SpotifyConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check for error in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, []);
  
  const handleConnectSpotify = () => {
    setIsLoading(true);
    window.location.href = '/api/spotify/login';
  };
  
  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'state_mismatch':
        return 'Security verification failed. Please try again.';
      case 'token_error':
        return 'Failed to authenticate with Spotify. Please try again.';
      case 'token_exchange_failed':
        return 'Failed to complete Spotify authentication. Please try again.';
      case 'missing_code':
        return 'Authentication code missing. Please try again.';
      default:
        return `An error occurred: ${errorCode}. Please try again.`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect to Spotify</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Connect your Spotify account to select songs for language learning. We'll need access to your playlists and saved tracks.
            </p>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleConnectSpotify}
                disabled={isLoading}
                className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Connect Spotify
                  </>
                )}
              </button>
              
              <Link
                href="/"
                className="text-center text-indigo-600 hover:text-indigo-800"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
