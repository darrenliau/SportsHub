import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { reportFrontendError } from './services/logging'

// Global error handlers to send errors to backend logs
window.onerror = function(message, source, lineno, colno, error) {
  reportFrontendError({ message: String(message), source, lineno, colno, stack: error && error.stack });
};

window.onunhandledrejection = function(event) {
  const reason = (event as any).reason;
  reportFrontendError({ message: reason?.message || 'UnhandledRejection', stack: reason?.stack });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
