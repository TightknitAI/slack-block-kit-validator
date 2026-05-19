import type { Env } from "./types.js";

const LIMIT = 60;
const WINDOW_SECONDS = 60;

/**
 * Collapses an IPv6 address to its /64 prefix so a single user with an
 * IPv6 prefix (commonly /48–/64 assigned by ISPs) doesn't get one bucket
 * per address in that range. IPv4 addresses are kept whole.
 *
 * Examples:
 *   `2001:db8::1`              → `"2001:db8:0:0"`
 *   `2001:db8:0:0:1:2:3:4`     → `"2001:db8:0:0"`
 *   `2001:db8::`               → `"2001:db8:0:0"`
 *   `203.0.113.42`             → `"203.0.113.42"`
 *
 * Note: we don't need the output to be a valid IPv6 literal; it just has
 * to be a stable, collision-free key per /64. Splitting and rejoining is
 * sufficient and avoids the cost of full address parsing.
 */
const prefixKey = (ip: string): string => {
  if (!ip.includes(":")) return ip; // IPv4 — keep whole.

  // Expand the `::` shorthand, then keep the first four groups.
  if (ip.includes("::")) {
    const [head, tail] = ip.split("::", 2);
    const headGroups = head ? head.split(":").filter(Boolean) : [];
    const tailGroups = tail ? tail.split(":").filter(Boolean) : [];
    const missing = Math.max(0, 8 - headGroups.length - tailGroups.length);
    const groups = [...headGroups, ...Array(missing).fill("0"), ...tailGroups];
    return groups.slice(0, 4).join(":");
  }
  return ip.split(":").slice(0, 4).join(":");
};

/**
 * Extracts a stable per-client key from request headers. Prefers
 * `cf-connecting-ip` (set by Cloudflare on the edge); falls back to
 * `x-forwarded-for` for `wrangler dev`, and finally `"anonymous"` so a
 * missing header doesn't multi-tenant the binding — but in production
 * `cf-connecting-ip` is always set, so that branch only triggers in dev.
 */
export const keyFromRequest = (request: Request): string => {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return prefixKey(cf);
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return prefixKey(first);
  }
  return "anonymous";
};

/** Exported for tests. */
export const __prefixKeyForTests = prefixKey;

/**
 * Standard rate-limit response headers. Uses the IETF RateLimit draft format
 * (`policy` / `limit` with `w=` window) so well-behaved clients can self-pace.
 */
const rateLimitHeaders = (): Record<string, string> => ({
  "RateLimit-Policy": `${LIMIT};w=${WINDOW_SECONDS}`,
  "RateLimit-Limit": `${LIMIT};w=${WINDOW_SECONDS}`,
});

/**
 * Runs the rate-limit check. Returns headers to merge into the eventual
 * response when allowed, or a 429 `Response` when not.
 *
 * The binding is per-colo and intentionally permissive — a determined client
 * routed across colos can exceed the nominal limit. That tradeoff is fine for
 * a public unauthenticated endpoint; reach for Durable Objects only when
 * global accuracy actually matters.
 */
export async function checkRateLimit(
  request: Request,
  env: Env,
): Promise<{ allowed: true; headers: Record<string, string> } | { allowed: false; response: Response }> {
  const key = keyFromRequest(request);
  const { success } = await env.RATE_LIMITER.limit({ key });
  const headers = rateLimitHeaders();

  if (success) return { allowed: true, headers };

  return {
    allowed: false,
    response: new Response(
      JSON.stringify({
        error: "rate_limited",
        message: `Rate limit exceeded: ${LIMIT} requests per ${WINDOW_SECONDS}s. Self-host the validator from npm to skip the public quota.`,
        meta: {
          provider: env.PROVIDER_NAME,
          providerUrl: env.PROVIDER_URL,
          repo: env.REPO_URL,
        },
      }),
      {
        status: 429,
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": String(WINDOW_SECONDS),
        },
      },
    ),
  };
}
