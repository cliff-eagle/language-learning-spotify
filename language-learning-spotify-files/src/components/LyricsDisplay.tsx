'use client';

import { useState } from 'react';
import { ProcessedLyricsLine } from '@/lib/types';

interface VocabularyCardProps {
  word: string;
  translation: string;
  partOfSpeech: string;
  examples: string[];
  onClose: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  translation,
  partOfSpeech,
  examples,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{word}</h3>
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
          <div>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              {partOfSpeech}
            </span>
            <p className="mt-2 text-lg">{translation}</p>
          </div>
          
          {examples.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Examples
              </h4>
              <ul className="space-y-2">
                {examples.map((example, index) => (
                  <li key={index} className="text-gray-600 italic">"{example}"</li>
                ))}
              </ul>
            </div>
          )}
          
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
              Add to Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LyricsDisplayProps {
  line: ProcessedLyricsLine;
  color: string;
  showTransliteration: boolean;
  showTranslation: boolean;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  line,
  color,
  showTransliteration,
  showTranslation
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [vocabularyData, setVocabularyData] = useState<{
    word: string;
    translation: string;
    partOfSpeech: string;
    examples: string[];
  } | null>(null);

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    
    // Simulate fetching vocabulary data
    // In a real implementation, this would call an API to get word details
    setTimeout(() => {
      setVocabularyData({
        word: word,
        translation: "Example translation",
        partOfSpeech: "noun",
        examples: [
          "This is an example sentence using the word.",
          "Here is another example of how to use it."
        ]
      });
    }, 300);
  };

  const closeVocabularyCard = () => {
    setSelectedWord(null);
    setVocabularyData(null);
  };

  // Split the line into words for interactive vocabulary lookup
  const words = line.original.split(/\s+/);

  return (
    <div className="space-y-2">
      <div className="text-2xl font-medium" style={{ color }}>
        {words.map((word, index) => (
          <span key={index}>
            <span 
              className="cursor-pointer hover:underline hover:bg-indigo-50 px-1 py-0.5 rounded"
              onClick={() => handleWordClick(word)}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
      
      {showTransliteration && line.transliteration && (
        <div className="text-xl" style={{ color }}>
          {line.transliteration}
        </div>
      )}
      
      {showTranslation && line.translation && (
        <div className="text-lg text-gray-600" style={{ color }}>
          {line.translation}
        </div>
      )}

      {vocabularyData && (
        <VocabularyCard 
          word={vocabularyData.word}
          translation={vocabularyData.translation}
          partOfSpeech={vocabularyData.partOfSpeech}
          examples={vocabularyData.examples}
          onClose={closeVocabularyCard}
        />
      )}
    </div>
  );
};
