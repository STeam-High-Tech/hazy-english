// src/components/SearchForm.tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Spinner } from './Spinner';
import { Notification } from './Notification';

type SearchFormProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
};

export function SearchForm({ searchTerm, setSearchTerm, onSearch, isLoading, error, setError }: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-tokyo-night-bg2/50 backdrop-blur-sm border border-tokyo-night-comment/10 rounded-xl p-4 sm:p-6 shadow-tokyo transition-all duration-300 hover:shadow-tokyo-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-tokyo-night-comment" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-tokyo-night-bg border border-tokyo-night-comment/20 rounded-lg shadow-sm placeholder-tokyo-night-comment/50 text-tokyo-night-fg focus:outline-none focus:ring-2 focus:ring-tokyo-night-blue focus:border-tokyo-night-blue/50 sm:text-sm transition-all duration-200"
            placeholder="Search for a word..."
            aria-label="Search for a word"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-tokyo-night-bg bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-cyan hover:from-tokyo-night-blue/90 hover:to-tokyo-night-cyan/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tokyo-night-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
          aria-label={isLoading ? 'Searching...' : 'Search'}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Spinner size="sm" color="blue" className="mr-2" />
              <span>Searching...</span>
            </span>
          ) : (
            <span className="flex items-center">
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </span>
          )}
        </button>
      </form>
      {error && (
        <div className="mt-4">
          <Notification message={error} onDismiss={() => setError('')} />
        </div>
      )}
    </div>
  );
}