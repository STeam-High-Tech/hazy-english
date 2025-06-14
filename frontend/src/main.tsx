import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/theme.css'; // Import theme first
import './styles/globals.css';
import App from './App';

// Theme context for managing dark/light mode
const ThemeContext = React.createContext({
  isDark: false,
});

// Custom hook for theme detection
function useThemeDetector() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const getCurrentTheme = () => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    };

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      updateTheme(e.matches);
    };

    const updateTheme = (isDarkMode: boolean) => {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    // Set initial theme
    const darkMode = getCurrentTheme();
    setIsDark(darkMode);
    updateTheme(darkMode);

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  return { isDark };
}

// Theme provider component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeDetector();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main app container
function AppContainer() {
  return (
    <StrictMode>
      <Router>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Router>
    </StrictMode>
  );
}

// Render the app
const root = createRoot(document.getElementById('root')!);
root.render(<AppContainer />);

// Export the theme context for use in other components
export { ThemeContext };
