# slack-block-kit-validator demo

Live playground hosted at **<https://slack-block-kit-validator.tightknit.dev>**.

Paste Block Kit JSON, switch target (`blocks` / `modal` / `home`) and surface,
see every error — including the cross-payload rules Slack's own Block Kit
Builder won't surface.

## Running locally

```sh
# from the repo root, install root deps first (provides ajv etc.)
pnpm install

# then the demo's own deps
cd demo
pnpm install
pnpm dev
```

Vite serves at <http://localhost:5173>. The demo aliases
`@tightknitai/slack-block-kit-validator` to `../src/index.ts`, so any edits to
the library show up immediately under HMR.

## Build

```sh
pnpm --filter @tightknitai/slack-block-kit-validator-demo build
# or
cd demo && pnpm build
```

Output goes to `demo/dist/`.

## Deploy

Deployed via the Cloudflare Workers Builds GitHub integration — no CI workflow
in this repo. Cloudflare watches the repo and rebuilds on every push to `main`.

The project is configured as a **Worker with static assets**, not classic
Pages. `wrangler.jsonc` in this directory declares the asset directory and
SPA fallback; the build settings in the Cloudflare dashboard just need to
point at this directory:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `demo` |
| Build command | `pnpm install && pnpm build` |
| Deploy command | (auto — reads `wrangler.jsonc`) |
| Node version | `20` (env var `NODE_VERSION=20`) |

Custom domain `slack-block-kit-validator.tightknit.dev` is mapped under the
Worker's **Domains & Routes** settings.
