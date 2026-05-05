import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// EMERGENCY CACHE BUSTER
// This ensures that any corrupted session data from previous versions is cleared
const VERSION = '2.4.1';
const storedVersion = localStorage.getItem('GHOST_APP_VERSION');

if (storedVersion !== VERSION) {
  console.log('[GHOST] New Version Detected. Clearing Cache...');
  localStorage.clear();
  localStorage.setItem('GHOST_APP_VERSION', VERSION);
  window.location.reload();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
