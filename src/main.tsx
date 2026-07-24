import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

// Service worker registration (PWA-ready)
// PWA functionality is set up via manifest.webmanifest; SW can be added
// with Workbox or vite-plugin-pwa in a future update.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Placeholder — register real SW here when added.
  });
}
