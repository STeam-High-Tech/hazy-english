// src/App.tsx
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuthContext';
import { useVocabulary } from "./hooks/useVocabulary";
import { SearchForm } from "./components/SearchForm";
import { SavedWordsList } from "./components/SavedWordsList";
import { WordDetails } from "./components/WordDetails";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Protected content component that requires authentication
function ProtectedContent() {
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
    <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column - Search and saved words */}
          <div className="lg:col-span-1 space-y-6">
            <SearchForm
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={searchWord}
              isLoading={isLoading}
              error={error}
              setError={setError}
            />

            <SavedWordsList
              words={savedWords}
              currentWordId={currentWord?.id}
              onSelectWord={selectWord}
              onDeleteWord={deleteWord}
              onPlayAudio={playAudio}
            />
          </div>

          {/* Right column - Word details */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-tokyo-night-red/20 text-tokyo-night-red rounded-lg">
                {error}
              </div>
            )}

            {isLoading && !currentWord ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tokyo-night-blue"></div>
              </div>
            ) : currentWord ? (
              <WordDetails wordData={currentWord} onPlayAudio={playAudio} isLoading={isLoading} />
            ) : (
              <div className="bg-tokyo-night-bg2 rounded-xl p-6 h-64 flex items-center justify-center text-tokyo-night-comment">
                Search for a word to see details
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Main App Layout
function AppLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-tokyo-night-bg font-sans text-tokyo-night-fg transition-colors duration-200">
      <header className="bg-tokyo-night-bg2/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm border-b border-tokyo-night-comment/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-magenta bg-clip-text text-transparent tracking-tight">
            Hazy English
          </h1>
          
          <div className="flex items-center gap-4">
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
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-tokyo-night-red hover:bg-tokyo-night-red/10 rounded-md transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<ProtectedContent />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Main App component
export default function App() {
  return <AppLayout />;
}
