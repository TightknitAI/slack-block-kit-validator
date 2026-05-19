import { env, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

// Host is irrelevant — SELF dispatches to the worker by binding, not DNS.
const url = (path: string) => `https://api.example.com${path}`;

const VALID_BLOCKS = [
  { type: "section", text: { type: "mrkdwn", text: "Hello *world*" } },
] as const;

describe("GET /", () => {
  it("302s to the configured playground", async () => {
    const res = await SELF.fetch(url("/"), { redirect: "manual" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(env.PLAYGROUND_URL);
  });

  it("includes a Link header pointing at the OpenAPI spec", async () => {
    const res = await SELF.fetch(url("/"), { redirect: "manual" });
    const link = res.headers.get("Link") ?? "";
    expect(link).toContain("/openapi.json");
    expect(link).toContain('rel="service-desc"');
  });

  it("sets security headers", async () => {
    const res = await SELF.fetch(url("/"), { redirect: "manual" });
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });
});

describe("GET /healthz", () => {
  it("returns 200 ok", async () => {
    const res = await SELF.fetch(url("/healthz"));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("GET /openapi.json", () => {
  it("returns a 3.1 spec naming Tightknit in info.contact", async () => {
    const res = await SELF.fetch(url("/openapi.json"));
    expect(res.status).toBe(200);
    const spec = (await res.json()) as {
      openapi: string;
      info: { contact: { name: string; url: string } };
      paths: Record<string, unknown>;
    };
    expect(spec.openapi.startsWith("3.1")).toBe(true);
    expect(spec.info.contact.name).toBe(env.PROVIDER_NAME);
    expect(spec.info.contact.url).toBe(env.PROVIDER_URL);
    expect(spec.paths["/v1/validate"]).toBeDefined();
  });
});

describe("OPTIONS / preflight", () => {
  it("responds 204 with CORS headers", async () => {
    const res = await SELF.fetch(url("/v1/validate"), { method: "OPTIONS" });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
    // Authorization is intentionally NOT advertised — the endpoint doesn't use it.
    expect(res.headers.get("Access-Control-Allow-Headers")).not.toContain("Authorization");
  });
});

describe("POST /v1/validate", () => {
  const postJson = (body: unknown) =>
    SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("returns valid=true with attribution meta for a good payload", async () => {
    const res = await postJson({ input: VALID_BLOCKS, target: "blocks", surface: "message" });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { valid: boolean; errors: string[]; meta: { provider: string; validator: string } };
    expect(data.valid).toBe(true);
    expect(data.errors).toEqual([]);
    expect(data.meta.provider).toBe(env.PROVIDER_NAME);
    expect(data.meta.validator).toBe("@tightknitai/slack-block-kit-validator");
  });

  it("returns valid=false with errors for a bad payload", async () => {
    const res = await postJson({
      input: [
        { type: "section" }, // missing required text
        { type: "divider", block_id: "x" },
        { type: "divider", block_id: "x" }, // duplicate block_id
      ],
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { valid: boolean; errors: string[] };
    expect(data.valid).toBe(false);
    expect(data.errors.length).toBeGreaterThan(0);
  });

  it("sets X-Powered-By + Cache-Control: no-store on 200", async () => {
    const res = await postJson({ input: VALID_BLOCKS });
    expect(res.headers.get("X-Powered-By")).toContain("@tightknitai/slack-block-kit-validator");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("405s with Allow header on non-POST", async () => {
    const res = await SELF.fetch(url("/v1/validate"), { method: "GET" });
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toContain("POST");
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("method_not_allowed");
  });

  it("400s with invalid_json on a body that isn't JSON", async () => {
    const res = await SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json {",
    });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_json");
  });

  it("400s with empty_body on an empty body", async () => {
    const res = await SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "",
    });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("empty_body");
  });

  it("400s with missing_input when `input` is absent", async () => {
    const res = await postJson({ target: "blocks" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("missing_input");
  });

  it("400s with invalid_target on an unknown target", async () => {
    const res = await postJson({ input: VALID_BLOCKS, target: "not-a-target" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_target");
  });

  it("400s with invalid_surface on an unknown surface", async () => {
    const res = await postJson({ input: VALID_BLOCKS, surface: "not-a-surface" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_surface");
  });

  it("400s with invalid_body when body is a JSON primitive", async () => {
    const res = await SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "42",
    });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("invalid_body");
  });

  it("413s on declared Content-Length over the cap (fast path)", async () => {
    const res = await SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": String(300 * 1024) },
      // Tiny actual body — we're testing the declared-length fast-reject.
      body: JSON.stringify({ input: VALID_BLOCKS }),
    });
    expect(res.status).toBe(413);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("payload_too_large");
  });

  it("413s on a body that streams past the cap without declaring Content-Length", async () => {
    // ~300 KB of valid JSON. Padding lives inside a string so the body is
    // still parseable JSON at small sizes — at >256 KB the streaming reader
    // aborts before parsing.
    const padding = "a".repeat(300 * 1024);
    const body = JSON.stringify({ input: VALID_BLOCKS, _pad: padding });
    const res = await SELF.fetch(url("/v1/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    expect(res.status).toBe(413);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("payload_too_large");
  });

  it("attaches CORS headers to error responses", async () => {
    const res = await postJson({ target: "blocks" }); // missing input → 400
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("validates the modal envelope when target=modal", async () => {
    const modal = {
      type: "modal",
      title: { type: "plain_text", text: "Review" },
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "Body" } }],
    };
    const res = await postJson({ input: modal, target: "modal" });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { valid: boolean };
    expect(data.valid).toBe(true);
  });

  it("rejects an `alert` block on a message surface", async () => {
    // `alert` is one of the blocks the surface-compat helper forbids on
    // messages (alongside `file`). Using it here exercises the cross-payload
    // rule the schema alone wouldn't catch.
    const res = await postJson({
      input: [{ type: "alert", title: { type: "plain_text", text: "Heads up" } }],
      target: "blocks",
      surface: "message",
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { valid: boolean; errors: string[] };
    expect(data.valid).toBe(false);
    expect(data.errors.some((e) => /alert/i.test(e) && /message/i.test(e))).toBe(true);
  });
});

describe("404", () => {
  it("returns 404 not_found JSON for unknown paths with CORS + security headers", async () => {
    const res = await SELF.fetch(url("/does/not/exist"));
    expect(res.status).toBe(404);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("not_found");
  });
});
