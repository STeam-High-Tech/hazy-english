import { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon, XMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

type WordData = {
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

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [savedWords, setSavedWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch saved words on component mount
  useEffect(() => {
    fetchSavedWords();
  }, []);

  const fetchSavedWords = async () => {
    try {
      const response = await axios.get(`${API_URL}/words`);
      setSavedWords(response.data);
    } catch (err) {
      console.error('Error fetching saved words:', err);
      setError('Failed to load saved words');
    }
  };

  const searchWord = async (word: string) => {
    if (!word.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/lookup?word=${encodeURIComponent(word)}`);
      setCurrentWord(response.data);
      
      // Update the saved words list if the word was just added
      if (!savedWords.some(w => w.id === response.data.id)) {
        setSavedWords(prev => [response.data, ...prev]);
      }
    } catch (err) {
      console.error('Error searching word:', err);
      setError('Word not found. Please try another word.');
      setCurrentWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWord = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/words/${id}`);
      setSavedWords(prev => prev.filter(word => word.id !== id));
      
      // Clear current word if it's the one being deleted
      if (currentWord?.id === id) {
        setCurrentWord(null);
      }
    } catch (err) {
      console.error('Error deleting word:', err);
      setError('Failed to delete word');
    }
  };

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchWord(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">English Vocabulary App</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search for a word..."
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isLoading || !searchTerm.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Word Details</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {currentWord ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900">{currentWord.word}</h3>
                      <div className="flex items-center space-x-2">
                        {currentWord.data.phonetics?.[0]?.text && (
                          <span className="text-gray-600">/{currentWord.data.phonetics[0].text}/</span>
                        )}
                        {currentWord.data.phonetics?.[0]?.audio && (
                          <button
                            onClick={() => playAudio(currentWord.data.phonetics?.[0]?.audio)}
                            className="p-1 text-indigo-600 hover:text-indigo-800"
                            title="Listen pronunciation"
                          >
                            <SpeakerWaveIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      {currentWord.data.meanings?.map((meaning, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <h4 className="text-sm font-medium text-indigo-600 uppercase tracking-wider">
                            {meaning.partOfSpeech}
                          </h4>
                          <ul className="mt-2 space-y-2">
                            {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                              <li key={defIndex} className="text-gray-700">
                                <p>{def.definition}</p>
                                {def.example && (
                                  <p className="text-sm text-gray-500 italic mt-1">"{def.example}"</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Search for a word to see its details
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Saved Words */}
          <div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Saved Words</h2>
              </div>
              <div className="border-t border-gray-200">
                {savedWords.length > 0 ? (
                  <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {savedWords.map((word) => (
                      <li key={word.id} className="px-4 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <button
                              onClick={() => setCurrentWord(word)}
                              className="text-left group"
                            >
                              <p className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                                {word.word}
                              </p>
                              {word.data.phonetics?.[0]?.text && (
                                <p className="text-xs text-gray-500">
                                  /{word.data.phonetics[0].text}/
                                </p>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            {word.data.phonetics?.[0]?.audio && (
                              <button
                                onClick={() => playAudio(word.data.phonetics?.[0]?.audio)}
                                className="text-gray-400 hover:text-indigo-600"
                                title="Listen"
                              >
                                <SpeakerWaveIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteWord(word.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">No saved words yet</p>
                    <p className="mt-1 text-sm text-gray-400">Search for a word and it will be saved automatically</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
