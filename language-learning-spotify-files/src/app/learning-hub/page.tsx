'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SavedSong, ProcessedLyrics, ProcessedLyricsLine, Script } from '@/lib/types';
import { languageToScripts } from '@/lib/types/lyrics';

export default function LearningHub() {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<SavedSong | null>(null);
  const [lyrics, setLyrics] = useState<ProcessedLyrics | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script>(Script.LATIN);
  const [availableScripts, setAvailableScripts] = useState<Script[]>([Script.LATIN]);
  const [lineColors, setLineColors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved songs on component mount
  useEffect(() => {
    fetchSavedSongs();
  }, []);

  // Fetch saved songs from API
  const fetchSavedSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/songs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved songs');
      }
      
      const data = await response.json();
      setSavedSongs(data.songs);
    } catch (error) {
      console.error('Error fetching saved songs:', error);
      setError('Failed to load your saved songs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch lyrics for selected song
  const fetchLyrics = async (songId: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await fetch(`/api/lyrics?songId=${songId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lyrics');
      }
      
      const processedLyrics = await response.json();
      setLyrics(processedLyrics);
      
      // Reset current line index
      setCurrentLineIndex(0);
      
      // Set available scripts based on language
      const language = processedLyrics.language.toLowerCase();
      const scripts = languageToScripts[language] || [Script.LATIN];
      setAvailableScripts(scripts);
      setSelectedScript(scripts[0]);
      
      // Generate colors for lines
      generateLineColors(processedLyrics.lines.length);
      
      // Generate transliteration if needed
      if (scripts.length > 1 && scripts[0] !== Script.LATIN) {
        await generateTransliteration(processedLyrics, scripts[0]);
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setError('Failed to load lyrics for this song. Please try another song.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate transliteration
  const generateTransliteration = async (processedLyrics: ProcessedLyrics, script: Script) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/lyrics/transliterate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processedLyrics,
          targetScript: script,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate transliteration');
      }
      
      const updatedLyrics = await response.json();
      setLyrics(updatedLyrics);
    } catch (error) {
      console.error('Error generating transliteration:', error);
      setError('Failed to generate transliteration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate translation
  const generateTranslation = async (processedLyrics: ProcessedLyrics, targetLanguage: string) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/lyrics/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processedLyrics,
          targetLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate translation');
      }
      
      const updatedLyrics = await response.json();
      setLyrics(updatedLyrics);
    } catch (error) {
      console.error('Error generating translation:', error);
      setError('Failed to generate translation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate random colors for lines
  const generateLineColors = (lineCount: number) => {
    const colors: Record<number, string> = {};
    const colorPalette = [
      "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", 
      "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", 
      "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", 
      "#ec4899", "#f43f5e"
    ];
    
    for (let i = 0; i < lineCount; i++) {
      colors[i] = colorPalette[i % colorPalette.length];
    }
    
    setLineColors(colors);
  };

  // Handle song selection
  const handleSelectSong = async (song: SavedSong) => {
    setSelectedSong(song);
    await fetchLyrics(song.id);
  };

  // Handle script change
  const handleScriptChange = async (script: Script) => {
    if (!lyrics) return;
    
    setSelectedScript(script);
    await generateTransliteration(lyrics, script);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle next line
  const nextLine = () => {
    if (!lyrics) return;
    
    if (currentLineIndex < lyrics.lines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
    }
  };

  // Handle previous line
  const prevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">Learning Hub</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-4 gap-6">
          {/* Song List */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Songs</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {savedSongs.length > 0 ? (
                  savedSongs.map(song => (
                    <button
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSong?.id === song.id
                          ? 'bg-indigo-100 border-indigo-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      } border`}
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {song.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {song.artist}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No songs saved yet</p>
                    <Link 
                      href="/spotify-songs" 
                      className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
                    >
                      Add songs from Spotify
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Learning Area */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6">
            {selectedSong && lyrics ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedSong.name}</h2>
                    <p className="text-gray-600">{selectedSong.artist}</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    {/* Transliteration Toggle */}
                    <div className="flex items-center">
                      <label htmlFor="transliteration-toggle" className="mr-2 text-sm text-gray-700">
                        Transliteration
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="transliteration-toggle"
                          checked={showTransliteration}
                          onChange={() => setShowTransliteration(!showTransliteration)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="transliteration-toggle"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            showTransliteration ? 'bg-indigo-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                    
                    {/* Translation Toggle */}
                    <div className="flex items-center">
                      <label htmlFor="translation-toggle" className="mr-2 text-sm text-gray-700">
                        Translation
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="translation-toggle"
                          checked={showTranslation}
                          onChange={() => setShowTranslation(!showTranslation)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="translation-toggle"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            showTranslation ? 'bg-indigo-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Script Selection */}
                {availableScripts.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transliteration Script
                    </label>
                    <div className="flex space-x-2">
                      {availableScripts.map(script => (
                        <button
                          key={script}
                          onClick={() => handleScriptChange(script)}
                          className={`px-4 py-2 rounded-md ${
                            selectedScript === script
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {script.charAt(0).toUpperCase() + script.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Lyrics Display */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[300px]">
                  {isProcessing ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Line */}
                      {lyrics.lines[currentLineIndex] && (
                        <div className="space-y-2">
                          <div 
                            className="text-2xl font-medium" 
                            style={{ color: lineColors[currentLineIndex] }}
                          >
                            {lyrics.lines[currentLineIndex].original}
                          </div>
                          
                          {showTransliteration && lyrics.lines[currentLineIndex].transliteration && (
                            <div 
                              className="text-xl" 
                              style={{ color: lineColors[currentLineIndex] }}
                            >
                              {lyrics.lines[currentLineIndex].transliteration}
                            </div>
                          )}
                          
                          {showTranslation && lyrics.lines[currentLineIndex].translation && (
                            <div 
                              className="text-lg text-gray-600" 
                              style={{ color: lineColors[currentLineIndex] }}
                            >
                              {lyrics.lines[currentLineIndex].translation}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Line Progress */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(currentLineIndex / (lyrics.lines.length - 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Playback Controls */}
                <div className="flex justify-center items-center space-x-6">
                  <button
                    onClick={prevLine}
                    disabled={currentLineIndex === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={nextLine}
                    disabled={currentLineIndex === lyrics.lines.length - 1}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <svg className="w-16 h-16 text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a song to start learning
                </h3>
                <p className="text-gray-500 max-w-md">
                  Choose a song from your saved list or add more songs from Spotify to begin your language learning journey.
                </p>
                
                {savedSongs.length === 0 && !isLoading && (
                  <Link 
                    href="/spotify-songs" 
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Songs from Spotify
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #4f46e5;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #4f46e5;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #d1d5db;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );
}
