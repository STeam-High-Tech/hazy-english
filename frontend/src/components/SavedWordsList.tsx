// src/components/SavedWordsList.tsx
import { SpeakerWaveIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { IconButton } from './IconButton';
import type { WordData } from '../hooks/useVocabulary';

type SavedWordsListProps = {
  words: WordData[];
  currentWordId?: number | null;
  onSelectWord: (word: WordData) => void;
  onDeleteWord: (id: number) => void;
  onPlayAudio: (audioUrl?: string) => void;
};

export function SavedWordsList({ words, currentWordId, onSelectWord, onDeleteWord, onPlayAudio }: SavedWordsListProps) {
  return (
    <div className="bg-tokyo-night-bg2/80 backdrop-blur-sm border border-tokyo-night-comment/10 rounded-xl overflow-hidden shadow-tokyo transition-all duration-300 hover:shadow-tokyo-lg">
      <div className="px-5 py-4 border-b border-tokyo-night-comment/10 bg-gradient-to-r from-tokyo-night-bg2/80 to-tokyo-night-bg3/50">
        <h2 className="text-lg font-semibold text-tokyo-night-fg2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-tokyo-night-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Saved Words
          {words.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-tokyo-night-blue/20 text-tokyo-night-blue rounded-full">
              {words.length}
            </span>
          )}
        </h2>
      </div>
      <div className="max-h-[60vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {words.length > 0 ? (
          <ul className="divide-y divide-tokyo-night-comment/10">
            {words.map((word) => {
              const audioInfo = word.data.phonetics?.find(p => p.audio);
              const isActive = word.id === currentWordId;
              
              return (
                <li 
                  key={word.id}
                  className={`px-5 py-3.5 transition-all duration-200 ${
                    isActive 
                      ? 'bg-tokyo-night-blue/10 border-l-2 border-tokyo-night-blue' 
                      : 'hover:bg-tokyo-night-bg3/30 border-l-2 border-transparent hover:border-tokyo-night-comment/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectWord(word)}
                      className="text-left flex-1 min-w-0 group"
                      aria-label={`View details for ${word.word}`}
                    >
                      <p 
                        className={`text-base font-medium truncate transition-colors ${
                          isActive 
                            ? 'text-tokyo-night-blue' 
                            : 'text-tokyo-night-fg group-hover:text-tokyo-night-blue/90'
                        }`}
                      >
                        {word.word}
                      </p>
                      {audioInfo?.text && (
                        <p className={`text-sm font-mono mt-0.5 ${
                          isActive 
                            ? 'text-tokyo-night-cyan' 
                            : 'text-tokyo-night-comment group-hover:text-tokyo-night-cyan/90'
                        }`}>
                          /{audioInfo.text}/
                        </p>
                      )}
                    </button>
                    <div className="flex items-center space-x-1.5">
                      {audioInfo?.audio && (
                        <IconButton 
                          onClick={() => onPlayAudio(audioInfo.audio)}
                          title="Listen pronunciation"
                          className="text-tokyo-night-comment hover:text-tokyo-night-blue hover:bg-tokyo-night-bg3/50"
                        >
                          <SpeakerWaveIcon className="h-4.5 w-4.5" />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => onDeleteWord(word.id)}
                        title="Remove from list"
                        className="text-tokyo-night-comment hover:text-tokyo-night-red hover:bg-tokyo-night-red/10"
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-tokyo-night-bg3/30 mb-4">
              <BookOpenIcon className="h-8 w-8 text-tokyo-night-comment/50"/>
            </div>
            <p className="mt-2 font-medium text-tokyo-night-fg2">Your vocabulary list is empty</p>
            <p className="mt-1 text-sm text-tokyo-night-comment">Search for a word to add it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}