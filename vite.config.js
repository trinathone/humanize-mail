import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // For local dev with `npm run dev` you can run the API as a separate
      // node server (see README) and proxy /api/* to it. With `vercel dev`
      // this proxy is unused — Vercel serves /api directly.
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
