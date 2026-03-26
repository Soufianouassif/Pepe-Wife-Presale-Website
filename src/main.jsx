import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './i18n/config'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Failed to find root element with id 'root'");
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
} catch (e) {
  console.error("Main.jsx: CRITICAL RENDER FAILURE", e);
  try {
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.color = 'red';
    container.style.background = 'white';

    const title = document.createElement('h1');
    title.textContent = 'CRITICAL LOAD ERROR';

    const pre = document.createElement('pre');
    pre.textContent = e?.stack || e?.message || String(e);

    container.appendChild(title);
    container.appendChild(pre);

    document.body.innerHTML = '';
    document.body.appendChild(container);
  } catch {}
}
