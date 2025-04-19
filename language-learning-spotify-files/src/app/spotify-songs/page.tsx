'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SpotifySong } from '@/lib/types';

export default function SpotifySongs() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [tracks, setTracks] = useState<SpotifySong[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<SpotifySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch playlists on component mount
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/spotify/playlists');
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const data = await response.json();
      setPlaylists(data.playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError('Failed to load playlists. Please try reconnecting to Spotify.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async (playlistId: string) => {
    try {
      setIsLoadingTracks(true);
      setError(null);
      setSelectedPlaylist(playlistId);
      
      const response = await fetch(`/api/spotify/tracks?playlistId=${playlistId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }
      
      const data = await response.json();
      setTracks(data.tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Failed to load tracks. Please try again.');
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const toggleTrackSelection = (track: SpotifySong) => {
    setSelectedTracks(prev => {
      // Check if track is already selected
      const isSelected = prev.some(t => t.id === track.id);
      
      if (isSelected) {
        // Remove track from selection
        return prev.filter(t => t.id !== track.id);
      } else {
        // Add track to selection
        return [...prev, track];
      }
    });
  };

  const isTrackSelected = (trackId: string) => {
    return selectedTracks.some(track => track.id === trackId);
  };

  const handleSaveSelection = async () => {
    if (selectedTracks.length === 0) {
      setError('Please select at least one song to save.');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/spotify/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracks: selectedTracks }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save tracks');
      }
      
      setSaveSuccess(true);
      
      // Redirect to learning hub after short delay
      setTimeout(() => {
        window.location.href = '/learning-hub';
      }, 2000);
    } catch (error) {
      console.error('Error saving tracks:', error);
      setError('Failed to save selected songs. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Songs for Learning</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                Songs saved successfully! Redirecting to learning hub...
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Playlists Column */}
              <div className="md:col-span-1 border-r border-gray-200 pr-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Playlists</h3>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => fetchTracks(playlist.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedPlaylist === playlist.id
                            ? 'bg-indigo-100 border-indigo-300'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        } border`}
                      >
                        <div className="flex items-center">
                          {playlist.imageUrl ? (
                            <img
                              src={playlist.imageUrl}
                              alt={playlist.name}
                              className="w-12 h-12 rounded mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800 truncate max-w-[180px]">
                              {playlist.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {playlist.trackCount} tracks
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tracks Column */}
              <div className="md:col-span-1 border-r border-gray-200 px-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {selectedPlaylist ? 'Tracks' : 'Select a Playlist'}
                </h3>
                
                {isLoadingTracks ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {tracks.map(track => (
                      <div
                        key={track.id}
                        onClick={() => toggleTrackSelection(track)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isTrackSelected(track.id)
                            ? 'bg-indigo-100 border-indigo-300'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        } border`}
                      >
                        <div className="flex items-center">
                          {track.imageUrl ? (
                            <img
                              src={track.imageUrl}
                              alt={track.name}
                              className="w-10 h-10 rounded mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {track.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {track.artist}
                            </div>
                          </div>
                          <div className="ml-2">
                            {isTrackSelected(track.id) ? (
                              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedPlaylist && tracks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No tracks found in this playlist
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected Tracks Column */}
              <div className="md:col-span-1 pl-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Selected Songs ({selectedTracks.length})
                </h3>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {selectedTracks.map(track => (
                    <div
                      key={track.id}
                      className="p-3 rounded-lg bg-indigo-50 border border-indigo-200"
                    >
                      <div className="flex items-center">
                        {track.imageUrl ? (
                          <img
                            src={track.imageUrl}
                            alt={track.name}
                            className="w-10 h-10 rounded mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {track.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {track.artist}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTrackSelection(track);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {selectedTracks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No songs selected yet
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSaveSelection}
                    disabled={selectedTracks.length === 0 || isSaving}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Selected Songs'}
                  </button>
                  
                  <Link
                    href="/spotify-connect"
                    className="block text-center text-indigo-600 hover:text-indigo-800"
                  >
                    Back to Spotify Connect
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
