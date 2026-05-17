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
Pages. `wrangler.jsonc` lives at the **repo root** (not in `demo/`) so CF
Workers Builds can find it without any "Root directory" override; it points
its `assets.directory` at `./demo/dist`.

The actual demo build runs via `pnpm run build:demo` (defined at the repo
root), which CDs into `demo/`, installs with `--frozen-lockfile`, and runs
Vite.

Cloudflare dashboard settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | (leave blank — repo root) |
| Build command | `pnpm run build:demo` |
| Deploy command | `npx wrangler versions upload` (default — reads `wrangler.jsonc`) |
| Node version | `20` (env var `NODE_VERSION=20`) |

Custom domain `slack-block-kit-validator.tightknit.dev` is mapped under the
Worker's **Domains & Routes** settings.
