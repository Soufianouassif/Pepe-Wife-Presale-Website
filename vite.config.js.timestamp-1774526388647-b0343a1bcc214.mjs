// vite.config.js
import { defineConfig } from "file:///C:/Users/ayoub/Documents/trae_projects/hgghgh/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ayoub/Documents/trae_projects/hgghgh/node_modules/@vitejs/plugin-react-swc/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  define: {
    "global": "globalThis"
  },
  resolve: {
    alias: {
      "process/": "process/browser.js",
      "process": "process/browser.js",
      buffer: "buffer",
      stream: "stream-browserify",
      util: "util",
      crypto: "crypto-browserify"
    }
  },
  optimizeDeps: {
    include: ["process", "buffer", "util", "stream-browserify", "crypto-browserify"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  build: {
    rollupOptions: {
      // Ensure Buffer is included in build
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxheW91YlxcXFxEb2N1bWVudHNcXFxcdHJhZV9wcm9qZWN0c1xcXFxoZ2doZ2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGF5b3ViXFxcXERvY3VtZW50c1xcXFx0cmFlX3Byb2plY3RzXFxcXGhnZ2hnaFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXlvdWIvRG9jdW1lbnRzL3RyYWVfcHJvamVjdHMvaGdnaGdoL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIGRlZmluZToge1xyXG4gICAgJ2dsb2JhbCc6ICdnbG9iYWxUaGlzJyxcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdwcm9jZXNzLyc6ICdwcm9jZXNzL2Jyb3dzZXIuanMnLFxyXG4gICAgICAncHJvY2Vzcyc6ICdwcm9jZXNzL2Jyb3dzZXIuanMnLFxyXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxyXG4gICAgICBzdHJlYW06ICdzdHJlYW0tYnJvd3NlcmlmeScsXHJcbiAgICAgIHV0aWw6ICd1dGlsJyxcclxuICAgICAgY3J5cHRvOiAnY3J5cHRvLWJyb3dzZXJpZnknLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydwcm9jZXNzJywgJ2J1ZmZlcicsICd1dGlsJywgJ3N0cmVhbS1icm93c2VyaWZ5JywgJ2NyeXB0by1icm93c2VyaWZ5J10sXHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyBFbnN1cmUgQnVmZmVyIGlzIGluY2x1ZGVkIGluIGJ1aWxkXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFVLFNBQVMsb0JBQW9CO0FBQ2xXLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFdBQVcsVUFBVSxRQUFRLHFCQUFxQixtQkFBbUI7QUFBQSxJQUMvRSxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQTtBQUFBLElBRWY7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
