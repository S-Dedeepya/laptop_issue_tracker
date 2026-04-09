import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ["@hugeicons/core-free-icons"],
  },
  server: {
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.tailwindcss/**"],
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});
