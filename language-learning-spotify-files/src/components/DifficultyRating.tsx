'use client';

import { useState } from 'react';
import { SavedSong } from '@/lib/types';

interface DifficultyRatingProps {
  song: SavedSong;
  language: string;
  onClose: () => void;
}

export const DifficultyRating: React.FC<DifficultyRatingProps> = ({
  song,
  language,
  onClose
}) => {
  // Simulated difficulty metrics
  const difficultyMetrics = {
    overall: 3.5, // 1-5 scale
    vocabulary: 4.2,
    grammar: 3.8,
    pronunciation: 2.9,
    speed: 3.1,
  };
  
  // Simulated language level mapping
  const difficultyToLevel = (score: number) => {
    if (score < 2) return 'Beginner';
    if (score < 3) return 'Elementary';
    if (score < 4) return 'Intermediate';
    if (score < 4.5) return 'Upper Intermediate';
    return 'Advanced';
  };
  
  // Simulated recommendations
  const recommendations = [
    {
      name: "Slower songs in the same genre",
      description: "Try songs with similar vocabulary but slower tempo to build confidence."
    },
    {
      name: "Focus on pronunciation",
      description: "This song has some challenging pronunciation patterns. Practice with the pronunciation guide."
    },
    {
      name: "Review grammar points",
      description: "Several complex grammar structures appear in this song. Review them in the grammar explanations."
    }
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Difficulty Analysis</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">{song.name}</h4>
                <p className="text-gray-600">{song.artist}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">
                  {difficultyToLevel(difficultyMetrics.overall)}
                </div>
                <div className="text-sm text-gray-500">
                  {language} level
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Difficulty Breakdown
            </h4>
            
            <div className="space-y-3">
              {Object.entries(difficultyMetrics).map(([key, value]) => (
                key !== 'overall' && (
                  <div key={key} className="flex items-center">
                    <div className="w-32 text-gray-700 capitalize">{key}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(value / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-gray-700 font-medium">
                      {value.toFixed(1)}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Learning Recommendations
            </h4>
            
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-indigo-50 p-3 rounded-lg">
                  <h5 className="font-medium text-indigo-800">{rec.name}</h5>
                  <p className="text-indigo-600 text-sm mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
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
              Find Similar Level Songs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
