# slack-block-kit-validator

[![CI](https://github.com/TightknitAI/slack-block-kit-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/TightknitAI/slack-block-kit-validator/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/TightknitAI/slack-block-kit-validator/branch/main/graph/badge.svg)](https://codecov.io/gh/TightknitAI/slack-block-kit-validator)
[![npm version](https://img.shields.io/npm/v/@tightknitai/slack-block-kit-validator.svg)](https://www.npmjs.com/package/@tightknitai/slack-block-kit-validator)
[![bundle size](https://img.shields.io/bundlejs/size/@tightknitai/slack-block-kit-validator)](https://bundlejs.com/?q=%40tightknitai%2Fslack-block-kit-validator)
[![JSON Schema](https://img.shields.io/badge/JSON%20Schema-2020--12-blue)](https://json-schema.org/draft/2020-12/release-notes)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

JSON Schema (draft 2020-12) and validation helpers for Slack Block Kit JSON. Catches invalid block payloads before Slack silently swallows them.

**Try it live:** <https://block-kit-validator.tightknit.dev> — paste any payload, see every error in your browser.

## Why this exists

Slack's API returns `200 OK` when you send malformed Block Kit JSON — the metadata is dropped and the message renders as plain text (or a modal opens blank). The only way to find out is to eyeball a real Slack channel. Slack hasn't open-sourced their validator.

This package compiles every rule in <https://docs.slack.dev/reference/block-kit> into a single JSON Schema, plus a handful of helpers for the cross-payload rules JSON Schema can't express (duplicate `block_id`, cumulative markdown length, one-table-per-message, `focus_on_load` uniqueness, surface compatibility).

> Prefer an API call or an MCP server over an npm install? The repo also ships a Cloudflare Worker that exposes this package as a public, rate-limited HTTP endpoint plus a remote MCP server — see [`worker/`](./worker).

## Install

```sh
pnpm add @tightknitai/slack-block-kit-validator
```

Node 20+. No runtime peer dependencies.

## Quick start

```ts
import { validateBlockKit } from "@tightknitai/slack-block-kit-validator";

const blocks = [
  { type: "section", text: { type: "mrkdwn", text: "Hello *world*" } },
];

const { valid, errors } = validateBlockKit(blocks);
if (!valid) {
  console.error(errors);
}
```

### Validating views

`validateBlockKit` takes an optional `target` for modal / home view envelopes:

```ts
validateBlockKit(modalView, { target: "modal" });
validateBlockKit(homeView, { target: "home" });
```

When `target` is `modal` or `home`, the surface-compatibility check is enforced automatically. For bare blocks arrays, pass `surface` explicitly:

```ts
validateBlockKit(blocks, { surface: "message" });
// rejects alert/file on messages, markdown/table on modals, etc.
```

### Example output

```ts
validateBlockKit([
  { type: "section" },
  { type: "divider", block_id: "x" },
  { type: "divider", block_id: "x" },
]);

// {
//   valid: false,
//   errors: [
//     "/0 must match a schema in anyOf",
//     "blocks[2].block_id must be unique — 'x' appears at index 1 and 2"
//   ]
// }
```

## Using the helpers à la carte

The helpers are pure (no deps, no Ajv) and can be stacked on top of any validator — Zod, TypeBox, or a hand-rolled check:

```ts
import {
  findDuplicateBlockIds,
  checkCumulativeMarkdownLength,
  checkSingleTableBlock,
  checkFocusOnLoadUniqueness,
  checkSurfaceCompatibility,
} from "@tightknitai/slack-block-kit-validator";
```

### Using the raw JSON Schema

Consuming from another validator, another language, or an OpenAPI spec:

```ts
import { slackBlockKitSchema } from "@tightknitai/slack-block-kit-validator";

// With Ajv in a custom config
const ajv = new Ajv2020({ strict: false, allErrors: true });
const validate = ajv.compile(slackBlockKitSchema);
```

The schema uses `$defs` for every block, element, composition object, rich-text leaf, and view envelope, so non-JS consumers can also import the JSON (`@tightknitai/slack-block-kit-validator/schema.json`) and pick the subset they need.

## API reference

### Wrapper

| Export | Signature | Description |
|---|---|---|
| `validateBlockKit` | `(input, opts?) => { valid, errors[] }` | Runs schema + all caveat helpers. Defaults to validating a bare blocks array. |
| `ValidationResult` | `{ valid: boolean; errors: string[] }` | Return type. |
| `ValidationTarget` | `'blocks' \| 'modal' \| 'home'` | What shape `input` should match. |
| `ValidateBlockKitOptions` | `{ target?, surface? }` | Options bag. |
| `Surface` | `'message' \| 'modal' \| 'home'` | Surface compatibility target. |

### Helpers

| Helper | Signature | What it checks |
|---|---|---|
| `findDuplicateBlockIds` | `(blocks) => string[]` | Duplicate `block_id` values in a blocks array. |
| `checkCumulativeMarkdownLength` | `(blocks) => string[]` | Sum of all `markdown` block text > 12,000 chars. |
| `checkSingleTableBlock` | `(blocks) => string[]` | More than one `table` block per payload. |
| `checkDataVisualizationMax` | `(blocks) => string[]` | More than two `data_visualization` blocks per message. |
| `checkDataVisualizationConsistency` | `(blocks) => string[]` | Chart series with duplicate names, or data points that don't line up with `axis_config.categories`. |
| `checkFocusOnLoadUniqueness` | `(blocks) => string[]` | More than one element with `focus_on_load: true` in a view (walks nested elements + accessories). |
| `checkSurfaceCompatibility` | `(blocks, surface) => string[]` | Blocks not allowed on the target surface (e.g. `alert` on message, `markdown` on modal, `file_input` outside modals). |
| `checkCardActionsMax` | `(blocks) => string[]` | More than `CARD_ACTIONS_MAX` action buttons on a card block. |
| `checkNumberInputBounds` | `(blocks) => string[]` | `number_input` element with `min_value > max_value`. |
| `checkResponseUrlEnabledContext` | `(blocks, surface?) => string[]` | `response_url_enabled` set in contexts that don't support it. |

Each returns an array of human-readable error strings — empty when valid.

### Schema

| Export | Description |
|---|---|
| `slackBlockKitSchema` | The full JSON Schema as a parsed object. `$id` is `https://tightknit.com/schemas/slack-block-kit.schema.json`. |

## Coverage

- **20 blocks**: actions, alert, card, carousel, container, context, context_actions, data_visualization, divider, file, header, image, input, markdown, plan, rich_text, section, table, task_card, video.
- **All block elements**: button, icon_button, workflow_button, feedback_buttons, plain_text / email / url / number inputs, datepicker, datetimepicker, timepicker, file_input, rich_text_input, checkboxes, radio_buttons, image, overflow, url source, and all 5 single + 5 multi-select menu variants.
- **All 9 composition objects**: text (plain_text + mrkdwn), confirm, option (3 contextual variants), option_group, slack_file, dispatch_action_config, conversation_filter, trigger, workflow.
- **Rich text**: 4 container kinds (section, list, preformatted, quote) + 10 leaf kinds (text, link, user, usergroup, team, channel, emoji, broadcast, color, date) with style flags.
- **View envelopes**: `modal_view` + `home_view` under `$defs`.
- **Cross-payload rules** (via helpers): dup `block_id`, cumulative markdown, single-table, two-data-visualization-per-message, chart series/category consistency, `focus_on_load` uniqueness, surface compatibility.

Every documented `maxLength`, regex (date / time / user ID / channel ID / team ID format), enum value, and array cardinality limit is enforced structurally.

## What isn't enforced

Server-side rules that need app-config context or deep equality checks the schema doesn't attempt:

- Slack OAuth scope requirements (e.g. `links.embed:write` for video blocks).
- Initial-value matching (e.g. `radio_buttons.initial_option` must equal one of `options` by deep equality).
- `video_url` must match the app's configured unfurl domains.
- 10 MB per-file limit on `file_input` uploads.
- Slack's `block_id`-must-not-start-with `block_` rule is folklore (not stated on any current docs page) and intentionally not enforced.

## Note on `undefined` properties

`validateBlockKit` strips properties whose value is `undefined` before running Ajv. `JSON.stringify` drops these before the payload reaches Slack, so common builder patterns like `value: foo ?? undefined` are no-ops on the wire but would otherwise trip the schema's `additionalProperties: false`. Explicit `null` values are preserved — they survive `JSON.stringify` and may legitimately fail the schema.

## Entry points

The package ships several entry points so you only pay for what you use:

| Entry | Pulls Ajv? | Use when |
|---|---|---|
| `@tightknitai/slack-block-kit-validator` | yes | The full wrapper. `validateBlockKit`, helpers, schema, types. |
| `@tightknitai/slack-block-kit-validator/helpers` | no | Just the pure helpers — compose with Zod, TypeBox, your own validator. |
| `@tightknitai/slack-block-kit-validator/schema` | no | Just `slackBlockKitSchema` as a JS module. |
| `@tightknitai/slack-block-kit-validator/schema.json` | no | The raw JSON Schema file (for non-JS consumers). |
| `@tightknitai/slack-block-kit-validator/standalone` | no — precompiled | Self-contained validators for environments where Ajv is too heavy (Cloudflare Workers, Deno deploy). Exports `validateBlocks`, `validateModal`, `validateHome`. |
| `@tightknitai/slack-block-kit-validator/types` | no — types only | TypeScript types generated from the schema. `Block`, `SectionBlock`, `ModalView`, etc. |

```ts
// Worker-friendly: no Ajv at runtime
import { validateBlocks } from "@tightknitai/slack-block-kit-validator/standalone";

// Types straight from the schema (always in sync with what the validator accepts)
import type { Block, SectionBlock } from "@tightknitai/slack-block-kit-validator/types";
```

## Runtime & bundle considerations

The wrapper entry pulls in Ajv v8 + ajv-formats. The standalone entry has no runtime dependencies (its Ajv usage is fully inlined at build time) but is larger as a single bundle.

For most apps the recommended pattern is **validate in tests only** — use `validateBlockKit` in unit tests next to your block builders, and let CI catch regressions before they hit production.

## Hosted API & MCP

For when you'd rather call an endpoint than install the package:

- **`POST /v1/validate`** — JSON in / JSON out. Same return shape as `validateBlockKit`. OpenAPI 3.1 spec at `/openapi.json`.
- **Remote MCP server** — exposes a `validate_block_kit` tool over Streamable HTTP (`/mcp`) and SSE (`/sse`). Connects to Claude Code, Claude Desktop, and other MCP clients.

Hosted on Cloudflare Workers, rate-limited per IP via the Workers Rate Limiting binding. Source in [`worker/`](./worker); deployment + MCP client setup in [`worker/README.md`](./worker/README.md). For the interactive UI, the [live playground](https://block-kit-validator.tightknit.dev) covers that.

The published npm package is unaffected by the worker — install it directly for production / high-volume use to skip the network hop entirely.

## Contributing

See [MAINTAINING.md](./MAINTAINING.md) for how to keep the schema in sync with Slack's docs.

## License

MIT. See [LICENSE](./LICENSE).

---

Maintained by the [Tightknit](https://tightknit.ai) team.
