import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export type License = {
  name: string;
  url: string;
};

export type Phonetic = {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
};

export type Definition = {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
  vietnamese?: string;
  example_vietnamese?: string;
};

export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
};

export type WordData = {
  id: number;
  word: string;
  data: {
    word: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    license?: License;
    sourceUrls: string[];
    vietnamese?: {
      word: string;
    };
  };
  created_at: string;
};

const API_URL = 'https://hazy-eng.apifree.site/api';

export function useVocabulary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [savedWords, setSavedWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSavedWords = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/words`);
      setSavedWords(response.data);
    } catch (err) {
      console.error('Error fetching saved words:', err);
      setError('Failed to load saved words. Please try again later.');
    }
  }, []);

  useEffect(() => {
    fetchSavedWords();
  }, [fetchSavedWords]);

  const searchWord = async (wordToSearch: string) => {
    if (!wordToSearch.trim()) return;
    
    setIsLoading(true);
    setError('');
    setCurrentWord(null);
    
    try {
      const response = await axios.post<WordData>(`${API_URL}/lookup?word=${encodeURIComponent(wordToSearch)}`);
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
    } catch (err: unknown) {
      console.error('Error searching word:', err);
      let errorMessage = `Sorry, the word "${wordToSearch}" could not be found.`;
      
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCurrentWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWord = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/words/${id}`);
      setSavedWords(prev => prev.filter(word => word.id !== id));
      
      if (currentWord?.id === id) {
        setCurrentWord(null);
        setSearchTerm('');
      }
    } catch (err: unknown) {
      console.error('Error deleting word:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete the word.';
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