import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["aexo-icon-192.png", "aexo-icon-512.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,woff2}"],
      },
      manifest: {
        name: "Aexo - AI Assistant",
        short_name: "Aexo",
        description: "Your AI Sidekick. Always On. Always Smart.",
        theme_color: "#7c3aed",
        background_color: "#1a1025",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/aexo-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/aexo-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
