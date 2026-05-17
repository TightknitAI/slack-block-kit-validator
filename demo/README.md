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

Deployed via the Cloudflare Pages GitHub integration — no CI workflow in this
repo. Cloudflare watches the repo and rebuilds on every push to `main`.

Cloudflare Pages project settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `demo` |
| Build command | `pnpm install && pnpm build` |
| Build output directory | `dist` (resolves to `demo/dist`) |
| Node version | `20` (env var `NODE_VERSION=20`) |
| Package manager | pnpm (auto-detected from `packageManager` field) |

Custom domain `slack-block-kit-validator.tightknit.dev` is mapped in the
project's **Custom domains** tab.
