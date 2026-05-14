/**
 * Cap for recursive traversal of block payloads. Real Slack payloads are
 * bounded by their structural limits (≤100 blocks, ≤25 elements per block,
 * etc.), so genuine nesting never comes close to 50. Stop there to guard
 * against adversarial or malformed inputs.
 */
const MAX_WALK_DEPTH = 50;

/**
 * Slack allows at most one interactive element with `focus_on_load: true` per
 * view/payload. The walker recursively descends into every nested object and
 * array and counts any node whose `focus_on_load` is literally `true` — it
 * doesn't gate on element type, so for well-formed payloads this is
 * equivalent to "one focused element per view." The walk is depth-limited so
 * pathological inputs can't blow the stack.
 * @param blocks - array of Block Kit blocks or anything with a nested shape
 * @returns array of error messages (empty when zero or one node has `focus_on_load: true`)
 */
export function checkFocusOnLoadUniqueness(blocks: readonly unknown[]): string[] {
  const paths: string[] = [];

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
    const obj = node as Record<string, unknown>;
    if (obj.focus_on_load === true) {
      paths.push(path || "(root)");
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key === "focus_on_load") {
        continue;
      }
      walk(value, `${path}.${key}`, depth + 1);
    }
  };

  blocks.forEach((block, i) => {
    walk(block, `blocks[${i}]`, 0);
  });

  if (paths.length > 1) {
    return [`only one element per view may have 'focus_on_load: true' — found ${paths.length} at ${paths.join(", ")}`];
  }
  return [];
}
