import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = Buffer
window.global = window
window.process = process

import App from './App.jsx'
import './index.css'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
