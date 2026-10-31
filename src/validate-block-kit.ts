import { type FocusValidators, formatAjvErrors } from "./format-ajv-errors.js";
import { checkCardActionsMax } from "./helpers/check-card-actions-max.js";
import { checkCumulativeMarkdownLength } from "./helpers/check-cumulative-markdown-length.js";
import { checkDataVisualizationConsistency } from "./helpers/check-data-visualization-consistency.js";
import { checkDataVisualizationMax } from "./helpers/check-data-visualization-max.js";
import { checkFocusOnLoadUniqueness } from "./helpers/check-focus-on-load-uniqueness.js";
import { checkLayoutRules } from "./helpers/check-layout-rules.js";
import { checkNumberInputBounds } from "./helpers/check-number-input-bounds.js";
import { checkResponseUrlEnabledContext } from "./helpers/check-response-url-enabled-context.js";
import { checkSinglePlanBlock } from "./helpers/check-single-plan-block.js";
import { checkSingleTableBlock } from "./helpers/check-single-table-block.js";
import { checkSurfaceCompatibility, type Surface } from "./helpers/check-surface-compatibility.js";
import { findDuplicateActionIds } from "./helpers/find-duplicate-action-ids.js";
import { findDuplicateBlockIds } from "./helpers/find-duplicate-block-ids.js";
import {
  blockValidators,
  elementValidators,
  validateBlocks,
  validateHome,
  validateModal,
} from "./precompiled-validators.js";

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

// Precompiled at build time (scripts/build-standalone.ts) rather than compiled
// with Ajv on import: Ajv compiles via `new Function()`, which a
// Content-Security-Policy without 'unsafe-eval' blocks.
const validators = {
  blocks: validateBlocks,
  modal: validateModal,
  home: validateHome,
} as const;

const focusValidators: FocusValidators = new Map(Object.entries(blockValidators));
const elementFocusValidators: FocusValidators = new Map(Object.entries(elementValidators));

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
 * Appends every message in `messages` to `target`.
 *
 * A plain `target.push(...messages)` passes one argument per element, so a
 * helper that returns enough messages overflows V8's argument limit and
 * throws `RangeError: Maximum call stack size exceeded` — from a payload
 * small enough to fit under any request-size cap. A loop has no such limit.
 * @param target - the accumulating error array
 * @param messages - messages to append
 */
const pushAll = (target: string[], messages: readonly string[]): void => {
  for (const message of messages) {
    target.push(message);
  }
};

/**
 * Validates a Slack Block Kit payload against the JSON Schema and the set of
 * caveat helpers (duplicate block_ids, duplicate action_ids within a block,
 * cumulative markdown length, single-table, single-plan, focus_on_load
 * uniqueness, layout nesting and row rules, surface compatibility).
 *
 * The helpers run only once the payload satisfies the JSON Schema. When the
 * schema rejects it, the schema errors are returned on their own: the caveat
 * rules are cross-checks between fields that are already known to be
 * well-formed, and skipping them keeps a payload that ignores the schema's
 * size caps from reaching the helpers' per-element loops. `valid` is the same
 * either way — schema errors alone already make it `false`.
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
    pushAll(
      errors,
      formatAjvErrors(validator.errors ?? [], normalizedInput, target, focusValidators, elementFocusValidators),
    );
    // Stop before the cross-payload helpers. They only add value on a
    // structurally sound payload, and running them on a schema-invalid one is
    // what lets a caller drive their loops with arrays the schema would have
    // rejected — an `axis_config.categories` of 5,000 entries costs the
    // schema one `maxItems` error but costs the helpers real CPU per entry.
    // The verdict is unchanged either way: `valid` is already false.
    return { valid: false, errors };
  }

  const blocks = extractBlocks(normalizedInput, target) as readonly {
    type?: string;
    text?: string;
    block_id?: string;
    element?: { type?: string };
  }[];

  pushAll(errors, findDuplicateBlockIds(blocks));
  pushAll(errors, findDuplicateActionIds(blocks));
  pushAll(errors, checkCumulativeMarkdownLength(blocks));
  pushAll(errors, checkSingleTableBlock(blocks));
  pushAll(errors, checkSinglePlanBlock(blocks));
  pushAll(errors, checkDataVisualizationMax(blocks));
  pushAll(errors, checkDataVisualizationConsistency(blocks));
  pushAll(errors, checkCardActionsMax(blocks));
  pushAll(errors, checkLayoutRules(blocks));
  pushAll(errors, checkFocusOnLoadUniqueness(blocks));
  pushAll(errors, checkNumberInputBounds(blocks));
  pushAll(errors, checkResponseUrlEnabledContext(blocks, surface));
  if (surface) {
    pushAll(errors, checkSurfaceCompatibility(blocks, surface));
  }

  return { valid: errors.length === 0, errors };
}
