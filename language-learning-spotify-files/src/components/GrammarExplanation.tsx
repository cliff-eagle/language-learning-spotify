'use client';

import { useState } from 'react';

interface GrammarExplanationProps {
  sentence: string;
  explanation: string;
  grammarPoints: {
    term: string;
    description: string;
  }[];
  language: string;
  onClose: () => void;
}

export const GrammarExplanation: React.FC<GrammarExplanationProps> = ({
  sentence,
  explanation,
  grammarPoints,
  language,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Grammar Explanation</h3>
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
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-lg text-indigo-800 italic">"{sentence}"</p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Explanation
            </h4>
            <p className="text-gray-600">{explanation}</p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Grammar Points
            </h4>
            <div className="space-y-4">
              {grammarPoints.map((point, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h5 className="font-medium text-gray-800">{point.term}</h5>
                  <p className="text-gray-600 mt-1">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-medium text-yellow-800 mb-2">Pro Tip</h5>
            <p className="text-yellow-700">
              Try to identify similar patterns in other lyrics to reinforce your understanding of these grammar points.
            </p>
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
              Save to Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
