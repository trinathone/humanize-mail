// vite.config.js
import { defineConfig } from "file:///sessions/intelligent-admiring-gates/mnt/anti%20grammarly/sincerely-app/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/intelligent-admiring-gates/mnt/anti%20grammarly/sincerely-app/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // For local dev with `npm run dev` you can run the API as a separate
      // node server (see README) and proxy /api/* to it. With `vercel dev`
      // this proxy is unused — Vercel serves /api directly.
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvaW50ZWxsaWdlbnQtYWRtaXJpbmctZ2F0ZXMvbW50L2FudGkgZ3JhbW1hcmx5L3NpbmNlcmVseS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9pbnRlbGxpZ2VudC1hZG1pcmluZy1nYXRlcy9tbnQvYW50aSBncmFtbWFybHkvc2luY2VyZWx5LWFwcC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvaW50ZWxsaWdlbnQtYWRtaXJpbmctZ2F0ZXMvbW50L2FudGklMjBncmFtbWFybHkvc2luY2VyZWx5LWFwcC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgIC8vIEZvciBsb2NhbCBkZXYgd2l0aCBgbnBtIHJ1biBkZXZgIHlvdSBjYW4gcnVuIHRoZSBBUEkgYXMgYSBzZXBhcmF0ZVxuICAgICAgLy8gbm9kZSBzZXJ2ZXIgKHNlZSBSRUFETUUpIGFuZCBwcm94eSAvYXBpLyogdG8gaXQuIFdpdGggYHZlcmNlbCBkZXZgXG4gICAgICAvLyB0aGlzIHByb3h5IGlzIHVudXNlZCBcdTIwMTQgVmVyY2VsIHNlcnZlcyAvYXBpIGRpcmVjdGx5LlxuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5WSVRFX0FQSV9QUk9YWSB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVksU0FBUyxvQkFBb0I7QUFDaGEsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJTCxRQUFRO0FBQUEsUUFDTixRQUFRLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxRQUN0QyxjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
