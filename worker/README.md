# slack-block-kit-validator worker

Cloudflare Worker that hosts the validator as a public HTTP API and as a remote MCP server. Built on Cloudflare's Workers Rate Limiting binding (GA) and the `agents` SDK's `McpAgent`.

## Endpoints

| Path | Method | Description |
|---|---|---|
| `/` | GET | 302 to the live demo at <https://slack-block-kit-validator.tightknit.dev>. Includes a `Link: </openapi.json>; rel="service-desc"` header so machine clients discover the spec without parsing HTML. |
| `/v1/validate` | POST | JSON in / JSON out. See `/openapi.json` for the schema. |
| `/openapi.json` | GET | OpenAPI 3.1 spec for `/v1/validate`. |
| `/mcp` | * | MCP Streamable HTTP transport (current standard). |
| `/sse` | * | MCP SSE transport (legacy MCP clients). |
| `/healthz` | GET | Liveness check. |

## Request shape

```sh
curl -X POST https://<your-host>/v1/validate \
  -H "Content-Type: application/json" \
  -d '{
    "input": [{ "type": "section", "text": { "type": "mrkdwn", "text": "hi *world*" } }],
    "target": "blocks",
    "surface": "message"
  }'
```

Returns:

```json
{
  "valid": true,
  "errors": [],
  "meta": {
    "provider": "Tightknit",
    "providerUrl": "https://tightknit.ai",
    "validator": "@tightknitai/slack-block-kit-validator",
    "repo": "https://github.com/TightknitAI/slack-block-kit-validator"
  }
}
```

- `target` (optional): `"blocks"` (default), `"modal"`, or `"home"`.
- `surface` (optional): `"message"`, `"modal"`, `"home"`. Only meaningful when `target=blocks` — modal/home views derive surface from the envelope.

## Rate limiting

- 60 requests / 60 seconds per IP, applied to `/v1/validate`, `/mcp`, `/sse`.
- 429 includes `Retry-After`. Standard `RateLimit-Policy` / `RateLimit-Limit` headers on all responses.
- Per-Cloudflare-colo counting — the binding is intentionally permissive, not a strict global counter. Fine for fair-use throttling; not a billing meter.
- Tune values in `wrangler.jsonc` under `ratelimits[].simple` (`period` must be `10` or `60`).

For per-API-key plans or strict global accuracy, swap the binding for a Durable Object-backed limiter — out of scope for this version.

## Development

```sh
pnpm install                       # from the repo root
pnpm --filter @tightknitai/slack-block-kit-validator-worker dev
```

`predev` builds the validator package so the worker can import it. `wrangler dev` then serves on `http://localhost:8787`.

## Deploy

```sh
pnpm --filter @tightknitai/slack-block-kit-validator-worker deploy
```

By default the worker publishes to `slack-block-kit-validator-api.<your-cf-subdomain>.workers.dev`. Add `routes` or `custom_domain` to `wrangler.jsonc` to point a real hostname at it (e.g. `api.slack-block-kit-validator.tightknit.dev`).

This Worker is intentionally separate from the demo Worker (the root `wrangler.jsonc`, deployed at `slack-block-kit-validator.tightknit.dev`). The demo is a pure static-asset Worker; this one runs server code for the API + MCP.

## MCP client setup

**Claude Code:**

```sh
claude mcp add --transport http blockkit https://<your-host>/mcp
```

**Claude Desktop** (still needs the `mcp-remote` bridge for HTTP transports):

```json
{
  "mcpServers": {
    "blockkit": {
      "command": "npx",
      "args": ["mcp-remote", "https://<your-host>/mcp"]
    }
  }
}
```

Tool exposed: `validate_block_kit({ input, target?, surface? })` → `{ valid, errors[] }`.

## Hosted vs self-hosted

The published instance is rate-limited per IP and intentionally permissive — fine for occasional use, the playground, and small LLM workflows. For production / high-volume use:

- `pnpm add @tightknitai/slack-block-kit-validator` and validate in-process (no network hop, no rate limit).
- Or fork this worker and deploy your own — config is one file (`wrangler.jsonc`).
