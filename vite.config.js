import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'process/': 'process/browser.js',
      'process': 'process/browser.js',
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
