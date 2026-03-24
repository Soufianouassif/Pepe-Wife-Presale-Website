import { Buffer } from 'buffer';

/**
 * Polyfills for browser environment.
 * Handled with extreme care for SES (Secure ECMAScript) environments.
 */
console.log("Polyfills: Starting initialization...");

if (typeof window !== 'undefined') {
  const safeDefine = (obj, prop, value) => {
    try {
      if (!(prop in obj)) {
        Object.defineProperty(obj, prop, {
          value,
          configurable: true,
          enumerable: true,
          writable: true
        });
      } else {
        console.log(`Polyfills: ${prop} already exists, skipping defineProperty`);
      }
    } catch (e) {
      console.warn(`Polyfills: Failed to safely define ${prop}, falling back to direct assignment`, e);
      try {
        obj[prop] = value;
      } catch (assignError) {
        console.error(`Polyfills: Failed to assign ${prop}`, assignError);
      }
    }
  };

  safeDefine(window, 'Buffer', Buffer);
  safeDefine(window, 'global', window);
  
  if (!window.process) {
    safeDefine(window, 'process', { env: {} });
  } else if (!window.process.env) {
    try {
      window.process.env = {};
    } catch (e) {
      console.warn("Polyfills: Failed to set process.env", e);
    }
  }
}

// Ensure Buffer is globally available
try {
  if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.Buffer === 'undefined') globalThis.Buffer = Buffer;
    if (typeof globalThis.global === 'undefined') globalThis.global = globalThis;
    if (typeof globalThis.process === 'undefined') globalThis.process = { env: {} };
  }
} catch (e) {
  console.error("Polyfills: Failed to set globalThis properties", e);
}

console.log("Polyfills: Initialization complete.");
