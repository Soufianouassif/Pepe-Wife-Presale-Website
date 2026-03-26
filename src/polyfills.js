import { Buffer } from 'buffer';

const IS_DEV = import.meta?.env?.DEV;

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
        if (IS_DEV) console.log(`Polyfills: ${prop} already exists, skipping defineProperty`);
      }
    } catch (e) {
      if (IS_DEV) console.warn(`Polyfills: Failed to safely define ${prop}, falling back to direct assignment`, e);
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
      if (IS_DEV) console.warn("Polyfills: Failed to set process.env", e);
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
