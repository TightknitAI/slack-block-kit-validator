/**
 * Cap for recursive traversal of block payloads. Real Slack payloads are
 * bounded by their structural limits (≤100 blocks, ≤25 elements per block,
 * etc.), so genuine nesting never comes close to 50. Stop there to guard
 * against adversarial or malformed inputs.
 */
const MAX_WALK_DEPTH = 50;

type NumberInputLike = {
  type?: string;
  min_value?: string;
  max_value?: string;
  initial_value?: string;
  is_decimal_allowed?: boolean;
};

/**
 * Inspect a single node: if it looks like a `number_input` element whose
 * `min_value` exceeds its `max_value`, push a human-readable error onto the
 * accumulator. Non-matching nodes are ignored — recursion is the walker's job.
 * @param node - the possibly-number_input node to inspect
 * @param path - dotted path to the node for use in error messages
 * @param errors - accumulator mutated in place with any error string
 */
const reportBoundsIssue = (node: NumberInputLike, path: string, errors: string[]): void => {
  if (node?.type !== "number_input") {
    return;
  }
  if (typeof node.min_value !== "string" || typeof node.max_value !== "string") {
    return;
  }
  const min = Number(node.min_value);
  const max = Number(node.max_value);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return;
  }
  if (min > max) {
    errors.push(
      `${path} number_input min_value (${node.min_value}) cannot be greater than max_value (${node.max_value})`,
    );
  }
};

/**
 * Inspect a `number_input` node with `is_decimal_allowed: false` and flag any
 * decimal string in `min_value`, `max_value`, or `initial_value`. Slack rejects
 * decimal bounds/initial values on integer-only number inputs server-side, even
 * though the docs don't spell out the constraint in plain language.
 * @param node - the possibly-number_input node to inspect
 * @param path - dotted path to the node for use in error messages
 * @param errors - accumulator mutated in place with any error string
 */
const reportIntegerOnlyIssue = (node: NumberInputLike, path: string, errors: string[]): void => {
  if (node?.type !== "number_input") {
    return;
  }
  if (node.is_decimal_allowed !== false) {
    return;
  }
  const integerOnlyFields: (keyof NumberInputLike)[] = ["min_value", "max_value", "initial_value"];
  for (const field of integerOnlyFields) {
    const raw = node[field];
    if (typeof raw !== "string") {
      continue;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && !Number.isInteger(parsed)) {
      errors.push(`${path} number_input ${field} ('${raw}') must be an integer when is_decimal_allowed is false`);
    }
  }
};

/**
 * Slack's number_input docs say:
 *   "The minimum value, cannot be greater than max_value."
 *   "The maximum value, cannot be less than min_value."
 * JSON Schema can't compare two sibling string-encoded numbers natively, so
 * this helper walks the blocks array (bounded by MAX_WALK_DEPTH) and reports
 * any number_input where min_value > max_value.
 * @param blocks - array of Block Kit blocks or anything with a nested shape
 * @returns array of human-readable error messages (empty when valid)
 */
export function checkNumberInputBounds(blocks: readonly unknown[]): string[] {
  const errors: string[] = [];

  const walk = (node: unknown, path: string, depth: number): void => {
    if (node == null || depth > MAX_WALK_DEPTH) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => {
        walk(item, `${path}[${i}]`, depth + 1);
      });
      return;
    }
    if (typeof node !== "object") {
      return;
    }
    reportBoundsIssue(node as NumberInputLike, path, errors);
    reportIntegerOnlyIssue(node as NumberInputLike, path, errors);
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      walk(value, `${path}.${key}`, depth + 1);
    }
  };

  blocks.forEach((block, i) => {
    walk(block, `blocks[${i}]`, 0);
  });
  return errors;
}
