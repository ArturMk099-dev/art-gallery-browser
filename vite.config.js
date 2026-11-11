import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/iiif": {
        target: "https://www.artic.edu",
        changeOrigin: true,
        headers: {
          "AIC-User-Agent": "art-gallery-browser (local learning project)",
        },
      },
    },
  },
});
