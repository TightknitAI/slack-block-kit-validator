import type { Env } from "./types.js";

const LIMIT = 60;
const WINDOW_SECONDS = 60;

/**
 * Extracts a stable per-client key from request headers. Prefers
 * `cf-connecting-ip` (set by Cloudflare on the edge); falls back to
 * `x-forwarded-for` for `wrangler dev`, and finally `"anonymous"` so a
 * missing header doesn't collapse all callers into the same bucket only
 * when running outside Cloudflare entirely.
 */
const keyFromRequest = (request: Request): string => {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "anonymous";
  return "anonymous";
};

/**
 * Standard rate-limit response headers. Uses the IETF RateLimit draft format
 * (`policy` / `limit` with `w=` window) so well-behaved clients can self-pace.
 */
const rateLimitHeaders = (): Record<string, string> => ({
  "RateLimit-Policy": `${LIMIT};w=${WINDOW_SECONDS}`,
  "RateLimit-Limit": `${LIMIT};w=${WINDOW_SECONDS}`,
});

/**
 * Runs the rate-limit check. Returns `null` if the request is allowed (callers
 * proceed and should merge `extraHeaders` into their final response), or a
 * 429 `Response` if the request should be rejected.
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
          "Retry-After": String(WINDOW_SECONDS),
        },
      },
    ),
  };
}
