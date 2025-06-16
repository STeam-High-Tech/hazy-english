import { useState, useEffect, useCallback } from 'react';
import { authAxios } from '../lib/axios';

export type License = {
  name: string;
  url: string;
};

export type Phonetic = {
  text: string | null;
  audio: string | null;
  source_url: string | null;
  license_name: string | null;
  license_url: string | null;
};

export type Definition = {
  definition: string;
  example: string | null;
  vietnamese: string | null;
  example_vietnamese: string | null;
};

export type Meaning = {
  part_of_speech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
};

export type WordData = {
  id: number;
  word: string;
  source_urls: string[];
  vietnamese_word: string | null;
  license_name: string | null;
  license_url: string | null;
  created_at: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
};

import { API_CONFIG } from '../config';

export function useVocabulary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [savedWords, setSavedWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSavedWords = useCallback(async () => {
    try {
      const response = await authAxios.get(API_CONFIG.WORDS.BASE);
      setSavedWords(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Error fetching saved words:', error.response?.data?.detail || err);
      setError(error.response?.data?.detail || 'Failed to fetch saved words');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchSavedWords();
  }, [fetchSavedWords]);

  const searchWord = async (wordToSearch: string) => {
    if (!wordToSearch.trim()) return;
    
    setIsLoading(true);
    setError('');
    setCurrentWord(null);
    
    try {
      const response = await authAxios.post<WordData>('/lookup', null, {
        params: { word: wordToSearch }
      });
      const foundWord = response.data;
      setCurrentWord(foundWord);
      
      // Check if word is already in saved words
      const existingWordIndex = savedWords.findIndex(w => w.word.toLowerCase() === foundWord.word.toLowerCase());
      
      if (existingWordIndex === -1) {
        // Add new word to the beginning of the list
        setSavedWords(prev => [foundWord, ...prev]);
      } else {
        // Update existing word
        setSavedWords(prev => {
          const updated = [...prev];
          updated[existingWordIndex] = foundWord;
          return updated;
        });
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      const errorMessage = error.response?.data?.detail || 'Failed to fetch word details';
      console.error('Error fetching word details:', errorMessage);
      
      setError(errorMessage);
      setCurrentWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWord = async (id: number) => {
    try {
      await authAxios.delete(`${API_CONFIG.WORDS.BASE}/${id}`);
      setSavedWords(prev => prev.filter(word => word.id !== id));
      
      if (currentWord?.id === id) {
        setCurrentWord(null);
        setSearchTerm('');
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      const errorMessage = error.response?.data?.detail || 'Failed to delete word';
      console.error('Error deleting word:', errorMessage);
      setError(errorMessage);
    }
  };

  const selectWord = (word: WordData) => {
    setCurrentWord(word);
    setError(''); // Clear any previous errors
  };
  
  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  };
  
  return {
    searchTerm,
    setSearchTerm,
    currentWord,
    savedWords,
    isLoading,
    error,
    setError,
    searchWord,
    deleteWord,
    selectWord,
    playAudio,
  };
}