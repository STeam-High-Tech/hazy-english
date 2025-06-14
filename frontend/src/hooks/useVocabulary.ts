// src/hooks/useVocabulary.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export type WordData = {
  id: number;
  word: string;
  data: {
    meanings: Array<{
      partOfSpeech: string;
      definitions: Array<{
        definition: string;
        example?: string;
      }>;
    }>;
    phonetic?: string;
    phonetics?: Array<{
      text?: string;
      audio?: string;
    }>;
  };
  created_at: string;
};

const API_URL = 'http://localhost:8000/api';

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
    setCurrentWord(null); // Clear previous result
    
    try {
      const response = await axios.get(`${API_URL}/lookup?word=${encodeURIComponent(wordToSearch)}`);
      const foundWord = response.data;
      setCurrentWord(foundWord);
      
      // Tự động cập nhật danh sách đã lưu nếu từ này là từ mới
      if (!savedWords.some(w => w.id === foundWord.id)) {
        setSavedWords(prev => [foundWord, ...prev]);
      }
    } catch (err) {
      console.error('Error searching word:', err);
      setError(`Sorry, the word "${wordToSearch}" could not be found.`);
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
    } catch (err) {
      console.error('Error deleting word:', err);
      setError('Failed to delete the word.');
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