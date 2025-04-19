'use client';

import { useState } from 'react';

interface PronunciationGuideProps {
  word: string;
  phonetic: string;
  audioUrl?: string;
  language: string;
  onClose: () => void;
}

export const PronunciationGuide: React.FC<PronunciationGuideProps> = ({
  word,
  phonetic,
  audioUrl,
  language,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playAudio = () => {
    if (!audioUrl) return;
    
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Pronunciation Guide</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-2xl font-medium text-indigo-700">{word}</h4>
            <p className="text-lg text-gray-600 mt-1">{phonetic}</p>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={playAudio}
              disabled={!audioUrl || isPlaying}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPlaying ? (
                <>
                  <span className="animate-pulse">Playing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.06-7.072M4.343 5.586a9 9 0 000 12.728" />
                  </svg>
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">Pronunciation Tips</h5>
            <ul className="space-y-2 text-gray-600">
              <li>• Focus on the stress pattern highlighted in the phonetic transcription</li>
              <li>• Pay attention to vowel sounds that may differ from your native language</li>
              <li>• Practice by repeating after the audio multiple times</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Practice More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
