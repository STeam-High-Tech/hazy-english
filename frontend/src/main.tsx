import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppContainer from './AppContainer';
import './styles/theme.css';
import './styles/globals.css';
import './styles/tokyoNight.css';

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppContainer />
    </StrictMode>
  );
}
