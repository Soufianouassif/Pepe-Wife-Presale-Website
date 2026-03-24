import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.global = window.global || window;
  window.process = window.process || { env: {} };
}

// Ensure Buffer is globally available for libraries that expect it
if (typeof Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

console.log("Polyfills initialized early and robustly");
