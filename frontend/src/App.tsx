// src/App.tsx
import { useVocabulary } from "./hooks/useVocabulary";
import { SearchForm } from "./components/SearchForm";
import { SavedWordsList } from "./components/SavedWordsList";
import { WordDetails } from "./components/WordDetails";

function App() {
  const {
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
  } = useVocabulary();

  return (
    <div className="min-h-screen bg-tokyo-night-bg font-sans text-tokyo-night-fg transition-colors duration-200">
      <header className="bg-tokyo-night-bg2/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm border-b border-tokyo-night-comment/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-magenta bg-clip-text text-transparent tracking-tight">
            Hazy English
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Theme Toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => document.documentElement.classList.toggle("dark")}
              className="p-2 rounded-lg bg-tokyo-night-bg3 text-tokyo-night-fg hover:bg-tokyo-night-selection transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
          </div>
          {/* Search Form */}
          <SearchForm
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={searchWord}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Word Details (chiếm 2 cột trên desktop) */}
            <div className="lg:col-span-2">
              <WordDetails
                wordData={currentWord}
                isLoading={isLoading}
                onPlayAudio={playAudio}
              />
            </div>

            {/* Saved Words (chiếm 1 cột trên desktop) */}
            <div className="lg:col-span-1">
              <SavedWordsList
                words={savedWords}
                currentWordId={currentWord?.id}
                onSelectWord={selectWord}
                onDeleteWord={deleteWord}
                onPlayAudio={playAudio}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-tokyo-night-comment text-sm border-t border-tokyo-night-comment/10">
        <p>
          A project of{" "}
          <span className="text-tokyo-night-blue">@hoangneeee</span>. Happy
          learning! 🚀
        </p>
      </footer>
    </div>
  );
}

export default App;
