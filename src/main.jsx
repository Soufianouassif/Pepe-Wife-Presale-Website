import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './i18n/config'

const PRIVY_APP_ID = import.meta?.env?.VITE_PRIVY_APP_ID || 'cmmotgl8z01t20clb428rweyu'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Failed to find root element with id 'root'");
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['google', 'twitter', 'telegram', 'email'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        appName: 'Pepe Wife Presale',
      }}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PrivyProvider>
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
