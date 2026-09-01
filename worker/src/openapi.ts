import type { Env } from "./types.js";

/**
 * Minimal OpenAPI 3.1 spec for the public validation endpoint. Kept thin on
 * purpose — the full Block Kit JSON Schema is shipped on npm and exposed at
 * `@tightknitai/slack-block-kit-validator/schema.json`; embedding the whole
 * thing here would bloat the spec without telling clients anything new.
 */
export function renderOpenApi(env: Env): Response {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Slack Block Kit Validator API",
      version: "0.1.0",
      summary: "Public, rate-limited Slack Block Kit validation as a service.",
      description:
        "Validates Slack Block Kit JSON against the full schema and Slack's documented cross-payload rules. " +
        "Hosted by Tightknit. Powered by the @tightknitai/slack-block-kit-validator npm package — " +
        "self-host for unlimited use.",
      contact: {
        name: env.PROVIDER_NAME,
        url: env.PROVIDER_URL,
      },
      license: { name: "MIT", identifier: "MIT" },
    },
    externalDocs: {
      description: "Source, schema, and helpers",
      url: env.REPO_URL,
    },
    paths: {
      "/v1/validate": {
        post: {
          summary: "Validate a Block Kit payload",
          description: "Returns `{ valid, errors[] }`. Errors is a flat list of human-readable messages.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidateRequest" },
                examples: {
                  blocks: {
                    summary: "Bare blocks array",
                    value: {
                      input: [{ type: "section", text: { type: "mrkdwn", text: "Hello *world*" } }],
                      target: "blocks",
                      surface: "message",
                    },
                  },
                  modal: {
                    summary: "Modal view envelope",
                    value: {
                      input: {
                        type: "modal",
                        title: { type: "plain_text", text: "Review" },
                        blocks: [{ type: "section", text: { type: "mrkdwn", text: "Body" } }],
                      },
                      target: "modal",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Validation complete (the payload may still be invalid — see `valid`).",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ValidateResponse" } } },
            },
            "400": {
              description: "Malformed request body or invalid options.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "413": {
              description: "Body exceeds the 256 KB cap.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "429": {
              description: "Rate limit exceeded (60 requests per 60 seconds per IP).",
              headers: {
                "Retry-After": {
                  schema: { type: "integer" },
                  description: "Seconds until the next request will be accepted.",
                },
              },
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "500": {
              description:
                "The validator failed to process the payload. An invalid payload returns 200 with `valid: false`, so this means a bug in the validator, not bad input.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ValidateRequest: {
          type: "object",
          required: ["input"],
          properties: {
            input: {
              description:
                "The Block Kit payload. An array of blocks when `target=blocks`; a view envelope when `target=modal` or `home`. " +
                "Full schema at @tightknitai/slack-block-kit-validator/schema.json.",
            },
            target: { type: "string", enum: ["blocks", "modal", "home"], default: "blocks" },
            surface: {
              type: "string",
              enum: ["message", "modal", "home"],
              description: "Only meaningful when target=blocks.",
            },
          },
          additionalProperties: false,
        },
        ValidateResponse: {
          type: "object",
          required: ["valid", "errors", "meta"],
          properties: {
            valid: { type: "boolean" },
            errors: { type: "array", items: { type: "string" } },
            meta: { $ref: "#/components/schemas/Meta" },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["error", "message", "meta"],
          properties: {
            error: { type: "string", description: "Machine-readable error code." },
            message: { type: "string" },
            meta: { $ref: "#/components/schemas/Meta" },
          },
        },
        Meta: {
          type: "object",
          required: ["provider", "providerUrl"],
          properties: {
            provider: { type: "string", example: env.PROVIDER_NAME },
            providerUrl: { type: "string", format: "uri", example: env.PROVIDER_URL },
            validator: { type: "string", example: "@tightknitai/slack-block-kit-validator" },
            repo: { type: "string", format: "uri", example: env.REPO_URL },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      "X-Powered-By": `@tightknitai/slack-block-kit-validator (${env.PROVIDER_URL})`,
    },
  });
}
