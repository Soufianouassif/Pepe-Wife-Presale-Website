import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './i18n/config'

console.log("Main.jsx: All polyfills and configs loaded. Attempting render...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Failed to find root element with id 'root'");
  }
  
  const root = ReactDOM.createRoot(rootElement);
  console.log("Main.jsx: Root created. Rendering App...");
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
  console.log("Main.jsx: Initial render call completed.");
} catch (e) {
  console.error("Main.jsx: CRITICAL RENDER FAILURE", e);
  document.body.innerHTML = `<div style="padding: 20px; color: red; background: white;"><h1>CRITICAL LOAD ERROR</h1><pre>${e.stack || e.message}</pre></div>`;
}
