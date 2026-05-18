// Schema-only entry: `@tightknitai/slack-block-kit-validator/schema`.
// Loads no Ajv runtime — for consumers wiring the schema into their own
// validator (TypeBox, Zod, another Ajv config, OpenAPI tooling, etc.).
// For non-JS consumers, the raw JSON is also available at
// `@tightknitai/slack-block-kit-validator/schema.json`.

export { default as slackBlockKitSchema } from "./slack-block-kit.schema.json" with { type: "json" };
