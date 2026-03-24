// vite.config.js
import { defineConfig } from "file:///C:/Users/ayoub/Documents/trae_projects/hgghgh/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ayoub/Documents/trae_projects/hgghgh/node_modules/@vitejs/plugin-react-swc/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    global: "globalThis"
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
    include: ["process", "buffer", "util", "stream-browserify", "crypto-browserify"]
  },
  build: {
    rollupOptions: {
      // Any external modules if needed
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxheW91YlxcXFxEb2N1bWVudHNcXFxcdHJhZV9wcm9qZWN0c1xcXFxoZ2doZ2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGF5b3ViXFxcXERvY3VtZW50c1xcXFx0cmFlX3Byb2plY3RzXFxcXGhnZ2hnaFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXlvdWIvRG9jdW1lbnRzL3RyYWVfcHJvamVjdHMvaGdnaGdoL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIGRlZmluZToge1xyXG4gICAgJ3Byb2Nlc3MuZW52Jzoge30sXHJcbiAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAncHJvY2Vzcy8nOiAncHJvY2Vzcy9icm93c2VyLmpzJyxcclxuICAgICAgJ3Byb2Nlc3MnOiAncHJvY2Vzcy9icm93c2VyLmpzJyxcclxuICAgICAgYnVmZmVyOiAnYnVmZmVyJyxcclxuICAgICAgc3RyZWFtOiAnc3RyZWFtLWJyb3dzZXJpZnknLFxyXG4gICAgICB1dGlsOiAndXRpbCcsXHJcbiAgICAgIGNyeXB0bzogJ2NyeXB0by1icm93c2VyaWZ5JyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFsncHJvY2VzcycsICdidWZmZXInLCAndXRpbCcsICdzdHJlYW0tYnJvd3NlcmlmeScsICdjcnlwdG8tYnJvd3NlcmlmeSddLFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgLy8gQW55IGV4dGVybmFsIG1vZHVsZXMgaWYgbmVlZGVkXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFVLFNBQVMsb0JBQW9CO0FBQ2xXLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sZUFBZSxDQUFDO0FBQUEsSUFDaEIsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxNQUNaLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFdBQVcsVUFBVSxRQUFRLHFCQUFxQixtQkFBbUI7QUFBQSxFQUNqRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBO0FBQUEsSUFFZjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
