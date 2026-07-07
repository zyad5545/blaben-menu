import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "version-1": resolve(__dirname, "version-1.html"),
        "version-2": resolve(__dirname, "version-2.html"),
        "version-3": resolve(__dirname, "version-3.html"),
        "version-4": resolve(__dirname, "version-4.html"),
        "version-5": resolve(__dirname, "version-5.html"),
        "version-6": resolve(__dirname, "version-6.html"),
        "version-7": resolve(__dirname, "version-7.html"),
        manage: resolve(__dirname, "manage.html"),
        "staff-portal": resolve(__dirname, "staff-portal-blaben-73.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
