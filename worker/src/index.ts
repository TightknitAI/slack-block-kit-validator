import { BlockKitMcp } from "./mcp.js";
import { renderOpenApi } from "./openapi.js";
import { checkRateLimit } from "./rate-limit.js";
import type { Env } from "./types.js";
import { handleValidate } from "./validate.js";

// Re-export the Durable Object class so wrangler can find it via the binding.
export { BlockKitMcp };

// Generous upper bound for any single MCP JSON-RPC envelope. Real MCP traffic
// is tiny (a few KB at most); 256 KB matches the validate endpoint cap and
// rejects abuse without affecting any legitimate client.
const MAX_MCP_BODY_BYTES = 256 * 1024;

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
//
// Header rationale:
// - CSP `default-src 'none'; frame-ancestors 'none'`: pure-JSON API has zero
//   need to load anything, and can't be iframed for clickjacking.
// - X-Content-Type-Options: prevents MIME sniffing.
// - Referrer-Policy: no leaking the API origin out.
// - Permissions-Policy: disables every powerful browser feature we don't use.
// - Cross-Origin-Opener-Policy: defends against cross-window side channels
//   (Spectre-class) even though we don't serve HTML.
// - Cross-Origin-Resource-Policy `cross-origin`: explicit "yes, this API is
//   meant to be loaded cross-origin" — opt-in vs the default of allowing
//   anything.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Permissions-Policy":
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

const corsPreflight = (): Response =>
  new Response(null, { status: 204, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } });

const jsonError = (
  status: number,
  code: string,
  message: string,
  env: Env,
  extraHeaders: Record<string, string> = {},
): Response =>
  new Response(
    JSON.stringify({
      error: code,
      message,
      meta: {
        provider: env.PROVIDER_NAME,
        providerUrl: env.PROVIDER_URL,
        repo: env.REPO_URL,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        ...extraHeaders,
      },
    },
  );

const notFound = (env: Env): Response =>
  jsonError(
    404,
    "not_found",
    "Unknown route. See /openapi.json for the API spec or the live demo for an interactive UI.",
    env,
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

// The agents SDK's `serve`/`serveSSE` static methods return loosely-typed
// handler objects (`{ fetch(req, env, ctx) }`). Localize the cast so the rest
// of the routing code stays clean.
interface McpHandler {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}
// biome-ignore lint/suspicious/noExplicitAny: agents SDK loose typing on static helpers.
const mcpServe = (): McpHandler => (BlockKitMcp as any).serve("/mcp");
// biome-ignore lint/suspicious/noExplicitAny: see mcpServe.
const mcpServeSse = (): McpHandler => (BlockKitMcp as any).serveSSE("/sse");

/**
 * Fast-reject pathologically-large MCP requests by their declared
 * Content-Length. The MCP SDK has its own internal handling, but stopping at
 * the edge avoids waking the Durable Object for a body that's never going to
 * be a legitimate JSON-RPC envelope.
 */
const overSizedMcp = (request: Request): boolean => {
  if (request.method !== "POST") return false;
  const declared = request.headers.get("content-length");
  if (declared === null) return false;
  const n = Number(declared);
  return Number.isFinite(n) && n > MAX_MCP_BODY_BYTES;
};

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

    // Everything below this point shares the rate-limit bucket. Keyed on IP
    // (truncated to /64 for IPv6 so a single user can't amplify across prefix).
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
    const isMcp = pathname === "/mcp" || pathname.startsWith("/mcp/");
    const isSse = pathname === "/sse" || pathname.startsWith("/sse/");

    if (isMcp || isSse) {
      if (overSizedMcp(request)) {
        return jsonError(
          413,
          "payload_too_large",
          `MCP request exceeds ${MAX_MCP_BODY_BYTES} bytes.`,
          env,
          extraHeaders,
        );
      }
      const handler = isMcp ? mcpServe() : mcpServeSse();
      const resp = await handler.fetch(request, env, ctx);
      // Layer in CORS + rate-limit headers without rewrapping the body stream.
      for (const [k, v] of Object.entries(extraHeaders)) resp.headers.set(k, v);
      return resp;
    }

    return notFound(env);
  },
} satisfies ExportedHandler<Env>;
