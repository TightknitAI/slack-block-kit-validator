/**
 * Workers Rate Limiting binding shape. Mirrors `@cloudflare/workers-types`
 * `RateLimit`, declared locally so this module is independent of types
 * package version drift.
 */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  RATE_LIMITER: RateLimit;
  MCP_OBJECT: DurableObjectNamespace;
  PROVIDER_NAME: string;
  PROVIDER_URL: string;
  REPO_URL: string;
}
