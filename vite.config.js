import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: "globalThis"
  },
  resolve: {
    alias: {
      'process/browser': 'process/browser',
      process: 'process/browser',
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['process', 'buffer', 'util', 'stream-browserify', 'crypto-browserify'],
  },
  build: {
    rollupOptions: {
      // Any external modules if needed
    }
  }
})
