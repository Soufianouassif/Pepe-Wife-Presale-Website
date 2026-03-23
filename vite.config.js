import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util', 'stream-browserify', 'crypto-browserify'],
  },
  build: {
    rollupOptions: {
      // Any external modules if needed
    }
  }
})
