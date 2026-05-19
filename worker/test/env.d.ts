// The `cloudflare:test` module is a vitest-pool-workers virtual import. Its
// types live under the package's `./types` subpath export. tsconfig's `types`
// array can't reference a subpath, so we pull it in via a triple-slash
// reference here. Vitest picks this file up because it lives under
// `test/**/*.ts` (included in tsconfig).
/// <reference types="@cloudflare/vitest-pool-workers/types" />

// `env` exported from `cloudflare:test` is typed as `Cloudflare.Env` — augment
// it with our worker's bindings so tests get the same typing as the runtime.
// Listed inline (not imported from src) because TS namespace augmentation
// can't merge an imported type into the global Cloudflare.Env reliably.
declare namespace Cloudflare {
  interface Env {
    RATE_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
    MCP_OBJECT: DurableObjectNamespace;
    PROVIDER_NAME: string;
    PROVIDER_URL: string;
    REPO_URL: string;
    PLAYGROUND_URL: string;
  }
}
