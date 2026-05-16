// Default entry point: `@tightknitai/slack-block-kit-validator`.
// Re-exports the full surface — Ajv-backed wrapper + helpers + raw schema.
// Tree-shake friendlier alternatives:
//   - `/helpers` (pure helpers, no Ajv)
//   - `/schema` (JSON schema only, no Ajv)
//   - `/standalone` (precompiled validators, no Ajv at runtime)
//   - `/types` (types only, generated from the schema)

export * from "./helpers.js";
export { default as slackBlockKitSchema } from "./slack-block-kit.schema.json" with { type: "json" };
export * from "./validate-block-kit.js";
