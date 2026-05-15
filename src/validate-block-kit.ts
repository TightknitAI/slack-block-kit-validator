import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { checkCardActionsMax } from "./helpers/check-card-actions-max.js";
import { checkCumulativeMarkdownLength } from "./helpers/check-cumulative-markdown-length.js";
import { checkFocusOnLoadUniqueness } from "./helpers/check-focus-on-load-uniqueness.js";
import { checkNumberInputBounds } from "./helpers/check-number-input-bounds.js";
import { checkResponseUrlEnabledContext } from "./helpers/check-response-url-enabled-context.js";
import { checkSingleTableBlock } from "./helpers/check-single-table-block.js";
import { checkSurfaceCompatibility, type Surface } from "./helpers/check-surface-compatibility.js";
import { findDuplicateBlockIds } from "./helpers/find-duplicate-block-ids.js";
import schema from "./slack-block-kit.schema.json" with { type: "json" };

/**
 * Result of a Block Kit validation.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Payload targets recognized by the wrapper. `blocks` validates a bare blocks
 * array; `modal` / `home` validate a view envelope.
 */
export type ValidationTarget = "blocks" | "modal" | "home";

export interface ValidateBlockKitOptions {
  /** Which top-level shape to validate. Defaults to `blocks`. */
  target?: ValidationTarget;
  /**
   * Which Slack surface the payload will render on. Used to enforce surface
   * compatibility. When `target` is `modal` or `home`, the surface is derived
   * automatically.
   */
  surface?: Surface;
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(schema, "slack-block-kit");

const compile = (ref: string): ValidateFunction => ajv.compile({ $ref: `slack-block-kit#/$defs/${ref}` });

const validators = {
  blocks: ajv.compile({ $ref: "slack-block-kit" }),
  modal: compile("modal_view"),
  home: compile("home_view"),
} as const;

const formatAjvError = (err: ErrorObject): string => {
  const path = err.instancePath || "(root)";
  return `${path} ${err.message ?? "failed validation"}`;
};

const resolveSurface = (target: ValidationTarget, surface: Surface | undefined): Surface | undefined => {
  if (target === "modal") {
    return "modal";
  }
  if (target === "home") {
    return "home";
  }
  return surface;
};

const extractBlocks = (input: unknown, target: ValidationTarget): readonly unknown[] => {
  if (target === "blocks") {
    return Array.isArray(input) ? input : [];
  }
  if (input != null && typeof input === "object" && "blocks" in input) {
    const { blocks } = input as { blocks: unknown };
    return Array.isArray(blocks) ? blocks : [];
  }
  return [];
};

/**
 * Cap for recursive traversal of payloads. Real Slack payloads are bounded by
 * their structural limits (≤100 blocks, ≤25 elements per block, etc.), so
 * genuine nesting never comes close to 50. Stop there to guard against
 * adversarial or malformed inputs. Matches the cap used in the other walkers
 * (`check-focus-on-load-uniqueness`, `check-number-input-bounds`).
 */
const MAX_STRIP_DEPTH = 50;

/**
 * Recursively normalizes a payload to mirror the shape Slack will actually see
 * after `JSON.stringify`:
 *   - drops object properties whose value is `undefined` (so common builder
 *     patterns like `value: foo ?? undefined` don't trip `additionalProperties:
 *     false`)
 *   - replaces `undefined` array slots with `null` (matching
 *     `JSON.stringify([undefined]) === '[null]'`), so schemas that accept
 *     explicit null placeholders still pass
 *
 * Depth-limited at {@link MAX_STRIP_DEPTH} to avoid stack overflow on
 * pathological inputs — nodes beyond that depth are returned as-is.
 * @param input - any value that may contain undefined-valued properties
 * @param depth - internal recursion depth counter
 * @returns a deep copy of the input with undefined properties removed and
 *   undefined array slots replaced with null
 */
const stripUndefined = (input: unknown, depth = 0): unknown => {
  if (depth > MAX_STRIP_DEPTH) {
    return input;
  }
  if (Array.isArray(input)) {
    // Use a manual length-indexed loop (not `.map`) so that sparse holes are
    // visited and normalized to null — `Array.prototype.map` skips missing
    // indices, but `JSON.stringify([, 1])` emits `'[null,1]'`, so the wire
    // shape includes nulls.
    const result = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      result[i] = item === undefined ? null : stripUndefined(item, depth + 1);
    }
    return result;
  }
  if (input !== null && typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      // Skip prototype-pollution vectors. A payload containing `__proto__`,
      // `constructor`, or `prototype` as a key would otherwise be assigned
      // via bracket notation into `result`, which can mutate the prototype
      // chain instead of setting a regular property.
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      if (value !== undefined) {
        result[key] = stripUndefined(value, depth + 1);
      }
    }
    return result;
  }
  return input;
};

/**
 * Validates a Slack Block Kit payload against the JSON Schema and the set of
 * caveat helpers (duplicate block_ids, cumulative markdown length, single-table,
 * focus_on_load uniqueness, surface compatibility).
 * @param input - the payload to validate
 * @param options - target shape + optional surface
 * @returns `{ valid, errors }` — `errors` is a flat array of human-readable messages
 */
export function validateBlockKit(input: unknown, options: ValidateBlockKitOptions = {}): ValidationResult {
  const target = options.target ?? "blocks";
  const surface = resolveSurface(target, options.surface);

  const normalizedInput = stripUndefined(input);

  const errors: string[] = [];

  const validator = validators[target];
  if (!validator(normalizedInput)) {
    for (const err of validator.errors ?? []) {
      errors.push(formatAjvError(err));
    }
  }

  const blocks = extractBlocks(normalizedInput, target) as readonly {
    type?: string;
    text?: string;
    block_id?: string;
    element?: { type?: string };
  }[];

  errors.push(...findDuplicateBlockIds(blocks));
  errors.push(...checkCumulativeMarkdownLength(blocks));
  errors.push(...checkSingleTableBlock(blocks));
  errors.push(...checkCardActionsMax(blocks));
  errors.push(...checkFocusOnLoadUniqueness(blocks));
  errors.push(...checkNumberInputBounds(blocks));
  errors.push(...checkResponseUrlEnabledContext(blocks, surface));
  if (surface) {
    errors.push(...checkSurfaceCompatibility(blocks, surface));
  }

  return { valid: errors.length === 0, errors };
}
