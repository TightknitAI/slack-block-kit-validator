import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Alias the published package name to the in-repo source so the demo always
// reflects HEAD without needing a workspace install or local link step.
const libRoot = fileURLToPath(new URL("../src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tightknitai/slack-block-kit-validator": `${libRoot}/index.ts`,
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
    // Ajv (~50 KB gzipped) and CodeMirror (~80 KB gzipped) together exceed the
    // default 500 KB un-gzipped warning. That's expected for a tool-in-browser
    // demo and not actionable, so lift the threshold to avoid log noise.
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
  },
});
