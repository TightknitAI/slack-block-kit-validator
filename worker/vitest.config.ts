import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

// vitest-pool-workers v0.16+ uses a Vite plugin (`cloudflareTest`) instead of
// the older `defineWorkersConfig` / `poolOptions.workers` shape. The plugin
// reads wrangler.jsonc and provisions all bindings (Durable Object, rate
// limiter, vars) inside a real Workers isolate via Miniflare.
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
  test: {
    include: ["test/**/*.test.ts"],
  },
});
