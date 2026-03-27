import { Buffer } from 'buffer';
import processPolyfill from 'process';

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
    safeDefine(window, 'process', processPolyfill);
  } else if (!window.process.env) {
    try {
      window.process.env = {};
    } catch (e) {
      if (IS_DEV) console.warn("Polyfills: Failed to set process.env", e);
    }
  }
  if (typeof window.process.nextTick !== 'function') {
    try {
      window.process.nextTick = processPolyfill.nextTick.bind(processPolyfill);
    } catch {}
  }
  if (typeof window.process.browser === 'undefined') {
    window.process.browser = true;
  }
  if (typeof window.setImmediate !== 'function') {
    window.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
  }
  if (typeof window.clearImmediate !== 'function') {
    window.clearImmediate = (id) => clearTimeout(id);
  }
}

// Ensure Buffer is globally available
try {
  if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.Buffer === 'undefined') globalThis.Buffer = Buffer;
    if (typeof globalThis.global === 'undefined') globalThis.global = globalThis;
    if (typeof globalThis.process === 'undefined') globalThis.process = processPolyfill;
    if (typeof globalThis.process.nextTick !== 'function') {
      globalThis.process.nextTick = processPolyfill.nextTick.bind(processPolyfill);
    }
    if (typeof globalThis.process.browser === 'undefined') {
      globalThis.process.browser = true;
    }
    if (typeof globalThis.setImmediate !== 'function') {
      globalThis.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
    }
    if (typeof globalThis.clearImmediate !== 'function') {
      globalThis.clearImmediate = (id) => clearTimeout(id);
    }
  }
} catch (e) {
  console.error("Polyfills: Failed to set globalThis properties", e);
}
