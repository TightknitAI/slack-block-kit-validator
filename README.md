# slack-block-kit-validator

[![CI](https://github.com/TightknitAI/slack-block-kit-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/TightknitAI/slack-block-kit-validator/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/TightknitAI/slack-block-kit-validator/branch/main/graph/badge.svg)](https://codecov.io/gh/TightknitAI/slack-block-kit-validator)
[![npm version](https://img.shields.io/npm/v/@tightknitai/slack-block-kit-validator.svg)](https://www.npmjs.com/package/@tightknitai/slack-block-kit-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

JSON Schema (draft 2020-12) and validation helpers for Slack Block Kit JSON. Catches invalid block payloads before Slack silently swallows them.

## Why this exists

Slack's API returns `200 OK` when you send malformed Block Kit JSON — the metadata is dropped and the message renders as plain text (or a modal opens blank). The only way to find out is to eyeball a real Slack channel. Slack hasn't open-sourced their validator.

This package compiles every rule in <https://docs.slack.dev/reference/block-kit> into a single JSON Schema, plus a handful of helpers for the cross-payload rules JSON Schema can't express (duplicate `block_id`, cumulative markdown length, one-table-per-message, `focus_on_load` uniqueness, surface compatibility).

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
// rejects input blocks, table on non-message surfaces, etc.
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
| `checkFocusOnLoadUniqueness` | `(blocks) => string[]` | More than one element with `focus_on_load: true` in a view (walks nested elements + accessories). |
| `checkSurfaceCompatibility` | `(blocks, surface) => string[]` | Blocks not allowed on the target surface (e.g. `input` on message, `video` on modal, `file_input` outside modals). |
| `checkCardActionsMax` | `(blocks) => string[]` | More than `CARD_ACTIONS_MAX` action buttons on a card block. |
| `checkNumberInputBounds` | `(blocks) => string[]` | `number_input` element with `min_value > max_value`. |
| `checkResponseUrlEnabledContext` | `(blocks, surface?) => string[]` | `response_url_enabled` set in contexts that don't support it. |

Each returns an array of human-readable error strings — empty when valid.

### Schema

| Export | Description |
|---|---|
| `slackBlockKitSchema` | The full JSON Schema as a parsed object. `$id` is `https://tightknit.com/schemas/slack-block-kit.schema.json`. |

## Coverage

- **18 blocks**: actions, alert, card, carousel, context, context_actions, divider, file, header, image, input, markdown, plan, rich_text, section, table, task_card, video.
- **All block elements**: button, icon_button, workflow_button, feedback_buttons, plain_text / email / url / number inputs, datepicker, datetimepicker, timepicker, file_input, rich_text_input, checkboxes, radio_buttons, image, overflow, url source, and all 5 single + 5 multi-select menu variants.
- **All 9 composition objects**: text (plain_text + mrkdwn), confirm, option (3 contextual variants), option_group, slack_file, dispatch_action_config, conversation_filter, trigger, workflow.
- **Rich text**: 4 container kinds (section, list, preformatted, quote) + 10 leaf kinds (text, link, user, usergroup, team, channel, emoji, broadcast, color, date) with style flags.
- **View envelopes**: `modal_view` + `home_view` under `$defs`.
- **Cross-payload rules** (via helpers): dup `block_id`, cumulative markdown, single-table, `focus_on_load` uniqueness, surface compatibility.

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

## Keeping up with Slack

Slack adds new block types and fields over time. To update:

1. Diff the latest at <https://docs.slack.dev/reference/block-kit> against the commit history of `src/slack-block-kit.schema.json`.
2. Add or amend the relevant `$defs/*` entry, including required / optional / maxLength / enum.
3. For new top-level blocks, add to `$defs/block.oneOf` and the `modal_view` / `home_view` inner arrays if applicable.
4. For new elements, add to the relevant parent-container whitelist (`actions_block_element`, `section_accessory_element`, `input_block_element`, `context_block_element`, or `context_actions_block_element`).
5. Add fixtures to `test/` covering both valid and invalid payloads.

## License

MIT. See [LICENSE](./LICENSE).

---

Maintained by the [Tightknit](https://tightknit.ai) team.
