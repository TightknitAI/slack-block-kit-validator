import { BlockKitMcp } from "./mcp.js";
import { renderOpenApi } from "./openapi.js";
import { checkRateLimit } from "./rate-limit.js";
import type { Env } from "./types.js";
import { handleValidate } from "./validate.js";

// Re-export the Durable Object class so wrangler can find it via the binding.
export { BlockKitMcp };

// CORS for the public API. Allow-Credentials is intentionally unset so the
// wildcard origin is safe. Only headers the endpoint actually reads are
// advertised — no point inviting clients to send headers we ignore.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// Generic hardening headers attached to every response. No inline scripts or
// styles are served from this worker (the playground lives at a separate
// host), so a strict CSP is feasible.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

const corsPreflight = (): Response =>
  new Response(null, { status: 204, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } });

const notFound = (env: Env): Response =>
  new Response(
    JSON.stringify({
      error: "not_found",
      message: "Unknown route. See /openapi.json for the API spec or the live demo for an interactive UI.",
      meta: {
        provider: env.PROVIDER_NAME,
        providerUrl: env.PROVIDER_URL,
        repo: env.REPO_URL,
        playground: env.PLAYGROUND_URL,
      },
    }),
    {
      status: 404,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...SECURITY_HEADERS },
    },
  );

/**
 * `GET /` — the worker hosts API + MCP only; the interactive playground lives
 * at a separate static-asset Worker (slack-block-kit-validator.tightknit.dev).
 * Send humans there with a 302, and include a `Link: </openapi.json>` header
 * so machine clients hitting the root can discover the spec without parsing
 * HTML.
 */
const indexRedirect = (env: Env): Response =>
  new Response(null, {
    status: 302,
    headers: {
      Location: env.PLAYGROUND_URL,
      "Cache-Control": "public, max-age=300",
      Link: '</openapi.json>; rel="service-desc"; type="application/json"',
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    },
  });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS preflight — never rate-limited, always cheap.
    if (request.method === "OPTIONS") {
      return corsPreflight();
    }

    // Static/cheap endpoints — not rate-limited (no per-request validator work).
    if (request.method === "GET" && pathname === "/") {
      return indexRedirect(env);
    }
    if (request.method === "GET" && pathname === "/openapi.json") {
      return renderOpenApi(env);
    }
    if (request.method === "GET" && pathname === "/healthz") {
      return new Response("ok", {
        status: 200,
        headers: { "Content-Type": "text/plain", ...CORS_HEADERS, ...SECURITY_HEADERS },
      });
    }

    // Everything below this point shares the rate-limit bucket. Keyed on IP.
    const rl = await checkRateLimit(request, env);
    if (!rl.allowed) {
      // Merge CORS so a browser-side fetch can read the 429 body.
      return new Response(rl.response.body, {
        status: rl.response.status,
        headers: { ...Object.fromEntries(rl.response.headers), ...CORS_HEADERS, ...SECURITY_HEADERS },
      });
    }
    const extraHeaders = { ...rl.headers, ...CORS_HEADERS, ...SECURITY_HEADERS };

    if (pathname === "/v1/validate") {
      return handleValidate(request, env, extraHeaders);
    }

    // MCP — Streamable HTTP (current standard) at /mcp, legacy SSE at /sse.
    // Both delegate to the agents SDK, which routes the request to the DO.
    if (pathname === "/mcp" || pathname.startsWith("/mcp/")) {
      // biome-ignore lint/suspicious/noExplicitAny: agents SDK return type is fine but its types are loose here.
      const handler = (BlockKitMcp as any).serve("/mcp");
      const resp = await handler.fetch(request, env, ctx);
      // Layer in CORS + rate-limit headers without rewrapping the body stream.
      for (const [k, v] of Object.entries(extraHeaders)) resp.headers.set(k, v);
      return resp;
    }
    if (pathname === "/sse" || pathname.startsWith("/sse/")) {
      // biome-ignore lint/suspicious/noExplicitAny: see /mcp branch above.
      const handler = (BlockKitMcp as any).serveSSE("/sse");
      const resp = await handler.fetch(request, env, ctx);
      for (const [k, v] of Object.entries(extraHeaders)) resp.headers.set(k, v);
      return resp;
    }

    return notFound(env);
  },
} satisfies ExportedHandler<Env>;
