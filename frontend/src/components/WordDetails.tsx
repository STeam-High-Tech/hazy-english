// src/components/WordDetails.tsx
import { MagnifyingGlassIcon, SpeakerWaveIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { IconButton } from './IconButton';
import type { WordData } from '../hooks/useVocabulary';
import { useState } from 'react';

type WordDetailsProps = {
  wordData: WordData | null;
  isLoading: boolean;
  onPlayAudio: (audioUrl?: string) => void;
};

// Skeleton Loader with Tokyo Night colors
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-tokyo-night-comment/20 rounded w-1/3"></div>
      <div className="h-6 bg-tokyo-night-comment/20 rounded w-1/4"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-tokyo-night-comment/20 rounded w-1/5"></div>
      <div className="h-5 bg-tokyo-night-comment/20 rounded"></div>
      <div className="h-5 bg-tokyo-night-comment/20 rounded w-5/6"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-tokyo-night-comment/20 rounded w-1/5"></div>
      <div className="h-5 bg-tokyo-night-comment/20 rounded"></div>
    </div>
  </div>
);

export function WordDetails({ wordData, isLoading, onPlayAudio }: WordDetailsProps) {
  const [showVietnamese, setShowVietnamese] = useState(true);
  
  const audioInfo = wordData?.data.phonetics?.find(p => p.audio);

  return (
    <div className="bg-tokyo-night-bg2/80 backdrop-blur-sm border border-tokyo-night-comment/10 rounded-xl overflow-hidden min-h-[400px] flex flex-col shadow-tokyo transition-all duration-300 hover:shadow-tokyo-lg">
      <div className="px-5 py-4 border-b border-tokyo-night-comment/10 bg-gradient-to-r from-tokyo-night-bg2/80 to-tokyo-night-bg3/50">
        <h2 className="text-lg font-semibold text-tokyo-night-fg2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-tokyo-night-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Word Details
        </h2>
      </div>
      <div className="p-5 sm:p-6 flex-grow">
        {isLoading ? (
          <DetailSkeleton />
        ) : !wordData ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-tokyo-night-comment">
            <MagnifyingGlassIcon className="h-14 w-14 text-tokyo-night-comment/30 mb-4" />
            <p className="font-medium text-tokyo-night-fg2">Search for a word to see its details.</p>
            <p className="text-sm mt-1 text-tokyo-night-comment">Or select a word from your saved list.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan bg-clip-text text-transparent">
                {wordData.word}
              </h3>
              <div className="flex items-center space-x-3">
                {audioInfo?.text && (
                  <span className="text-tokyo-night-fg2 text-lg font-mono">/{audioInfo.text}/</span>
                )}
                {audioInfo?.audio && (
                  <IconButton 
                    onClick={() => onPlayAudio(audioInfo.audio)} 
                    title="Listen pronunciation"
                    className="bg-tokyo-night-bg3 hover:bg-tokyo-night-selection text-tokyo-night-blue"
                  >
                    <SpeakerWaveIcon className="h-5 w-5" />
                  </IconButton>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-tokyo-night-fg2">Definitions</h3>
                <button
                  onClick={() => setShowVietnamese(!showVietnamese)}
                  className="flex items-center gap-1.5 text-sm text-tokyo-night-blue hover:text-tokyo-night-cyan transition-colors"
                >
                  <LanguageIcon className="h-4 w-4" />
                  {showVietnamese ? 'Hide Vietnamese' : 'Show Vietnamese'}
                </button>
              </div>
              
              {wordData.data.meanings?.map((meaning, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-sm font-semibold text-tokyo-night-blue uppercase tracking-wider">
                      {meaning.partOfSpeech}
                    </h4>
                    <div className="h-px flex-grow bg-tokyo-night-comment/20 group-hover:bg-tokyo-night-blue/50 transition-colors duration-300"></div>
                  </div>
                  <ul className="space-y-4 pl-2">
                    {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                      <li key={defIndex} className="relative pl-5 before:absolute before:left-0 before:top-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-tokyo-night-cyan">
                        <div className="space-y-2">
                          <div>
                            <p className="text-tokyo-night-fg">{def.definition}</p>
                            {showVietnamese && def.vietnamese && (
                              <p className="text-tokyo-night-green text-sm mt-1">
                                {def.vietnamese}
                              </p>
                            )}
                          </div>
                          
                          {def.example && (
                            <div className="text-sm text-tokyo-night-comment italic mt-2 pl-3 border-l-2 border-tokyo-night-comment/20">
                              <p>"{def.example}"</p>
                              {showVietnamese && def.example_vietnamese && (
                                <p className="text-tokyo-night-green/80">"{def.example_vietnamese}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {showVietnamese && wordData.data.vietnamese?.word && (
                <div className="mt-6 p-4 bg-tokyo-night-bg3/30 rounded-lg border border-tokyo-night-comment/10">
                  <h4 className="text-sm font-medium text-tokyo-night-fg2 mb-2">Vietnamese Translation</h4>
                  <p className="text-tokyo-night-green">{wordData.data.vietnamese.word}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}