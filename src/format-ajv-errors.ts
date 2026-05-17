import type { ErrorObject, ValidateFunction } from "ajv/dist/2020.js";

/**
 * Convert a JSON-pointer instancePath into the user-facing `blocks[N].field`
 * path the cross-payload helpers also use. RFC 6901 segment decoding is applied
 * so `~1` / `~0` round-trip correctly.
 *
 * - target = "blocks": root is the blocks array → `/0/text` → `blocks[0].text`
 * - target = "modal"/"home": root is the view → `/blocks/2/element` → `blocks[2].element`
 */
const normalizePath = (instancePath: string, target: "blocks" | "modal" | "home"): string => {
  if (!instancePath) {
    return "(root)";
  }
  const segments = instancePath.split("/").slice(1).map(decodePointerSegment);

  if (target === "blocks") {
    if (segments.length === 0) {
      return "(root)";
    }
    const head = segments[0];
    const rest = segments.slice(1);
    const idx = Number(head);
    if (Number.isInteger(idx) && head !== "") {
      return `blocks[${idx}]${formatTail(rest)}`;
    }
    return head + formatTail(rest);
  }

  if (segments.length === 0) {
    return "(root)";
  }
  if (segments[0] === "blocks" && segments.length >= 2) {
    const idx = Number(segments[1]);
    if (Number.isInteger(idx) && segments[1] !== "") {
      return `blocks[${idx}]${formatTail(segments.slice(2))}`;
    }
  }
  return segments[0] + formatTail(segments.slice(1));
};

const decodePointerSegment = (seg: string): string => seg.replace(/~1/g, "/").replace(/~0/g, "~");

const formatTail = (rest: readonly string[]): string => {
  let out = "";
  for (const seg of rest) {
    const idx = Number(seg);
    if (Number.isInteger(idx) && seg !== "") {
      out += `[${idx}]`;
    } else {
      out += `.${seg}`;
    }
  }
  return out;
};

const lookupAt = (root: unknown, instancePath: string): unknown => {
  let node: unknown = root;
  const segments = instancePath.split("/").slice(1).map(decodePointerSegment);
  for (const seg of segments) {
    if (node == null || typeof node !== "object") {
      return undefined;
    }
    if (Array.isArray(node)) {
      const idx = Number(seg);
      if (!Number.isInteger(idx)) {
        return undefined;
      }
      node = node[idx];
    } else {
      node = (node as Record<string, unknown>)[seg];
    }
  }
  return node;
};

const formatSingle = (err: ErrorObject, path: string): string => {
  const params = (err.params ?? {}) as Record<string, unknown>;
  switch (err.keyword) {
    case "required":
      return `${path}: missing required property '${String(params.missingProperty)}'`;
    case "additionalProperties":
      return `${path}: unknown property '${String(params.additionalProperty)}'`;
    case "type":
      return `${path}: expected ${String(params.type)}`;
    case "const":
      return `${path}: expected ${JSON.stringify(params.allowedValue)}`;
    case "enum": {
      const values = Array.isArray(params.allowedValues) ? params.allowedValues : [];
      return `${path}: expected one of [${values.map((v) => JSON.stringify(v)).join(", ")}]`;
    }
    case "maxLength":
      return `${path}: longer than ${String(params.limit)} characters`;
    case "minLength":
      return `${path}: shorter than ${String(params.limit)} characters`;
    case "maxItems":
      return `${path}: more than ${String(params.limit)} items`;
    case "minItems":
      return `${path}: fewer than ${String(params.limit)} items`;
    case "minimum":
      return `${path}: below minimum ${String(params.limit)}`;
    case "maximum":
      return `${path}: above maximum ${String(params.limit)}`;
    case "pattern":
      return `${path}: does not match ${String(params.pattern)}`;
    case "format":
      return `${path}: not a valid ${String(params.format)}`;
    default:
      return `${path}: ${err.message ?? "failed validation"}`;
  }
};

/**
 * Look-aside validators keyed by `block.type`. Populated by the caller
 * (validate-block-kit.ts) with one compiled validator per block def, so we
 * can re-validate a misbehaving block against just its discriminator-matched
 * branch and report focused errors instead of the full oneOf cascade.
 */
export type FocusValidators = ReadonlyMap<string, ValidateFunction>;

/**
 * Identify the canonical block-rooted path (`/N` for bare blocks, `/blocks/N`
 * for views) for an error. Returns null for errors that aren't scoped to a
 * particular block — they're emitted as-is.
 */
const blockPathOf = (instancePath: string, target: "blocks" | "modal" | "home"): string | null => {
  const segs = instancePath.split("/").slice(1);
  if (target === "blocks") {
    if (segs.length >= 1 && Number.isInteger(Number(segs[0])) && segs[0] !== "") {
      return `/${segs[0]}`;
    }
    return null;
  }
  if (segs.length >= 2 && segs[0] === "blocks" && Number.isInteger(Number(segs[1])) && segs[1] !== "") {
    return `/blocks/${segs[1]}`;
  }
  return null;
};

/**
 * Apply umbrella `oneOf`/`anyOf` suppression and emit focused errors with
 * their instancePath rewritten back into the original payload's coordinate
 * space (`bp` is the block's `/N` or `/blocks/N` path). The umbrella keywords
 * are dropped when other errors at the same instancePath (or deeper) are
 * already in the bucket — those underlying errors say everything the umbrella
 * does, with more detail.
 */
const META_KEYWORDS = new Set(["oneOf", "anyOf", "if", "not"]);

const pushFocusedErrors = (
  focused: readonly ErrorObject[],
  bp: string,
  target: "blocks" | "modal" | "home",
  push: (msg: string) => void,
): void => {
  const detailedPaths = new Set<string>();
  for (const err of focused) {
    if (!META_KEYWORDS.has(err.keyword)) {
      detailedPaths.add(err.instancePath);
    }
  }
  for (const err of focused) {
    if (META_KEYWORDS.has(err.keyword)) {
      const suppress = [...detailedPaths].some((p) => p === err.instancePath || p.startsWith(`${err.instancePath}/`));
      if (suppress) {
        continue;
      }
    }
    const rewrittenPath = `${bp}${err.instancePath}`;
    push(formatSingle({ ...err, instancePath: rewrittenPath }, normalizePath(rewrittenPath, target)));
  }
};

/**
 * Format AJV errors with normalized paths and friendly per-keyword messages.
 *
 * When a block fails its `oneOf` evaluation, AJV reports a failure against
 * every branch (~80 errors for a single typo). We collapse this by
 * re-validating each offending block against just the schema branch matching
 * its declared `type`, replacing the union noise with the real reason that
 * specific block didn't validate. Blocks whose `type` isn't a recognized block
 * kind fall back to the raw (deduplicated) AJV output.
 *
 * @param errors - the raw `validator.errors` array from AJV
 * @param root - the (normalized) input AJV ran against — used to read each
 *   block's `type` so we can pick the focused branch validator
 * @param target - validation target, controls path-normalization rooting
 * @param focusValidators - per-block-type compiled validators
 */
export function formatAjvErrors(
  errors: readonly ErrorObject[],
  root: unknown,
  target: "blocks" | "modal" | "home",
  focusValidators: FocusValidators,
): string[] {
  // Group errors by block path so we can replace each block's union cascade
  // with its focused-branch errors. Errors not scoped to a block (e.g. on the
  // root array itself, or on the view's title) are kept as-is.
  const byBlock = new Map<string, ErrorObject[]>();
  const standalone: ErrorObject[] = [];
  for (const err of errors) {
    const bp = blockPathOf(err.instancePath, target);
    if (bp == null) {
      standalone.push(err);
      continue;
    }
    let bucket = byBlock.get(bp);
    if (!bucket) {
      bucket = [];
      byBlock.set(bp, bucket);
    }
    bucket.push(err);
  }

  const out: string[] = [];
  const seen = new Set<string>();
  const push = (msg: string): void => {
    if (!seen.has(msg)) {
      seen.add(msg);
      out.push(msg);
    }
  };

  for (const err of standalone) {
    push(formatSingle(err, normalizePath(err.instancePath, target)));
  }

  for (const [bp, bucket] of byBlock) {
    const block = lookupAt(root, bp);
    const blockType =
      block != null && typeof block === "object" && !Array.isArray(block)
        ? (block as Record<string, unknown>).type
        : undefined;

    const focus = typeof blockType === "string" ? focusValidators.get(blockType) : undefined;
    if (focus) {
      focus(block);
      const focusedErrors = focus.errors ?? [];
      pushFocusedErrors(focusedErrors, bp, target, push);
      continue;
    }

    // No focus available — block.type is missing, non-string, or not a known
    // kind. AJV will have emitted dozens of per-branch errors (each branch's
    // const-on-type plus its own required fields). Collapse those into a
    // single useful message keyed on what we know about block.type.
    const blockPath = normalizePath(bp, target);
    if (block != null && typeof block === "object" && !Array.isArray(block) && !("type" in block)) {
      push(`${blockPath}: missing required property 'type'`);
      continue;
    }
    if (typeof blockType === "string") {
      // type is a string but isn't one of the 18 kinds we map.
      push(`${blockPath}.type: '${blockType}' is not a recognized block kind`);
      continue;
    }
    if (block != null && typeof block === "object" && !Array.isArray(block)) {
      // type is present but the wrong shape.
      const actual = blockType === null ? "null" : typeof blockType;
      push(`${blockPath}.type: expected string, got ${actual}`);
      continue;
    }
    // Block itself isn't an object — fall back to whatever shape errors AJV
    // emitted (e.g. "expected object"), but skip meta-keyword umbrellas.
    const concretePaths = new Set<string>();
    for (const err of bucket) {
      if (!META_KEYWORDS.has(err.keyword)) {
        concretePaths.add(err.instancePath);
      }
    }
    for (const err of bucket) {
      if (META_KEYWORDS.has(err.keyword)) {
        const suppress = [...concretePaths].some((p) => p === err.instancePath || p.startsWith(`${err.instancePath}/`));
        if (suppress) {
          continue;
        }
      }
      push(formatSingle(err, normalizePath(err.instancePath, target)));
    }
  }

  return out;
}
