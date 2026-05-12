import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { siteConfig } from './config/siteConfig.js';
import './index.css';

// Set the document title from site config on app mount. Production deployment
// can template this at build time via Vite's HTML transform if pre-paint title
// matters; a brief flicker on slow connections is acceptable for the prototype.
document.title = `${siteConfig.brandName} — Booking`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
