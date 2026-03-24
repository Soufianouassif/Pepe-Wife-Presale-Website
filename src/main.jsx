import { Buffer } from 'buffer';
if (!window.Buffer) {
  window.Buffer = Buffer;
}
window.global = window.global || window;
import process from 'process';
window.process = process;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
