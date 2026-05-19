import { type Surface, type ValidationTarget, validateBlockKit } from "@tightknitai/slack-block-kit-validator";
import type { Env } from "./types.js";

const MAX_BODY_BYTES = 256 * 1024; // 256 KB. Slack's largest legal payloads stay well below this.
const VALID_TARGETS: readonly ValidationTarget[] = ["blocks", "modal", "home"];
const VALID_SURFACES: readonly Surface[] = ["message", "modal", "home"];

interface ValidateBody {
  input: unknown;
  target?: ValidationTarget;
  surface?: Surface;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const providerMeta = (env: Env) => ({
  provider: env.PROVIDER_NAME,
  providerUrl: env.PROVIDER_URL,
  validator: "@tightknitai/slack-block-kit-validator",
  repo: env.REPO_URL,
});

const jsonResponse = (
  status: number,
  body: Record<string, unknown>,
  env: Env,
  extraHeaders: Record<string, string>,
  bonusHeaders: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify({ ...body, meta: providerMeta(env) }), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Error and validation responses are dynamic per-request; we never want
      // a browser or intermediary cache to serve a stale verdict.
      "Cache-Control": "no-store",
      ...bonusHeaders,
      ...extraHeaders,
    },
  });

/**
 * Streams the request body and aborts at MAX_BODY_BYTES, so a malicious
 * client can't force the worker to buffer the platform-cap-sized body
 * (~100 MB) before the size check. Bytes are tracked on raw chunk
 * `byteLength`, not decoded character count, so multi-byte UTF-8 can't
 * sneak past the cap.
 *
 * Content-Length is checked first as a fast-path; clients can lie about it
 * (omit or under-declare), which is why the streaming check is the real
 * enforcement point.
 */
const readBoundedJson = async (
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; status: number; code: string; message: string }> => {
  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      message: `Request body exceeds ${MAX_BODY_BYTES} bytes.`,
    };
  }

  if (!request.body) {
    return {
      ok: false,
      status: 400,
      code: "empty_body",
      message: "Request body is empty. Send JSON with an `input` field.",
    };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel("payload_too_large").catch(() => {});
        return {
          ok: false,
          status: 413,
          code: "payload_too_large",
          message: `Request body exceeds ${MAX_BODY_BYTES} bytes.`,
        };
      }
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
  } catch {
    return { ok: false, status: 400, code: "read_error", message: "Could not read request body." };
  }

  const raw = parts.join("");

  if (raw.trim() === "") {
    return {
      ok: false,
      status: 400,
      code: "empty_body",
      message: "Request body is empty. Send JSON with an `input` field.",
    };
  }

  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return {
      ok: false,
      status: 400,
      code: "invalid_json",
      message: `Body is not valid JSON: ${e instanceof Error ? e.message : "parse error"}.`,
    };
  }
};

/**
 * Handles `POST /v1/validate`. Body shape: `{ input, target?, surface? }`.
 * `input` is required; `target` defaults to `"blocks"`; `surface` is only
 * meaningful when `target === "blocks"` (modal/home auto-derive surface).
 */
export async function handleValidate(
  request: Request,
  env: Env,
  extraHeaders: Record<string, string>,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed", message: "Use POST." }, env, extraHeaders, {
      Allow: "POST, OPTIONS",
    });
  }

  const parsed = await readBoundedJson(request);
  if (!parsed.ok) {
    return jsonResponse(parsed.status, { error: parsed.code, message: parsed.message }, env, extraHeaders);
  }

  if (!isObject(parsed.value)) {
    return jsonResponse(
      400,
      { error: "invalid_body", message: "Body must be a JSON object with an `input` field." },
      env,
      extraHeaders,
    );
  }

  const body = parsed.value as Partial<ValidateBody>;

  if (!("input" in body)) {
    return jsonResponse(
      400,
      { error: "missing_input", message: "Body must include an `input` field." },
      env,
      extraHeaders,
    );
  }

  if (body.target !== undefined && !VALID_TARGETS.includes(body.target)) {
    return jsonResponse(
      400,
      { error: "invalid_target", message: `target must be one of: ${VALID_TARGETS.join(", ")}.` },
      env,
      extraHeaders,
    );
  }

  if (body.surface !== undefined && !VALID_SURFACES.includes(body.surface)) {
    return jsonResponse(
      400,
      { error: "invalid_surface", message: `surface must be one of: ${VALID_SURFACES.join(", ")}.` },
      env,
      extraHeaders,
    );
  }

  const result = validateBlockKit(body.input, { target: body.target, surface: body.surface });

  return jsonResponse(200, { valid: result.valid, errors: result.errors }, env, extraHeaders, {
    "X-Powered-By": `@tightknitai/slack-block-kit-validator (${env.PROVIDER_URL})`,
  });
}
