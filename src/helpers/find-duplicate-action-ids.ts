/**
 * Block properties that hold a block's interactive elements. Slack keys
 * `state.values` by `block_id` then `action_id`, so everything reachable from
 * one block shares a single `action_id` namespace. `element` / `accessory` are
 * single elements — they can't collide with anything, but they're listed for
 * consistency and cost nothing.
 */
const ELEMENT_KEYS = ["elements", "actions", "element", "accessory"] as const;

/**
 * Blocks whose children are themselves blocks, each opening its own
 * `action_id` namespace rather than sharing the parent's — a `carousel`'s
 * cards and a `container`'s child blocks each carry their own `block_id`.
 */
const CHILD_BLOCK_KEYS = new Map<string, string>([
  ["carousel", "elements"],
  ["container", "child_blocks"],
]);

/**
 * Cap for recursive traversal of block payloads. Well-formed payloads nest at
 * most one level here (carousel → card, container → child block), so anything
 * deeper is malformed or adversarial. Matches the cap used in the other
 * walkers (`check-focus-on-load-uniqueness`, `check-number-input-bounds`).
 */
const MAX_WALK_DEPTH = 50;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Returns error messages describing any duplicate `action_id` values within a
 * single block. Slack rejects a payload where two interactive elements in the
 * same block share an `action_id`. JSON Schema can't express per-property
 * uniqueness across sibling items, so this check sits alongside structural
 * validation like {@link findDuplicateBlockIds}.
 *
 * Uniqueness is required *within* a block, not across the payload: `state.values`
 * is keyed `block_id` then `action_id`, so the same `action_id` in two different
 * blocks is legal and is not flagged.
 * @param blocks - array of Block Kit blocks (or anything with a nested shape)
 * @returns array of human-readable error messages (empty when no duplicates)
 */
export function findDuplicateActionIds(blocks: readonly unknown[]): string[] {
  const errors: string[] = [];

  const visit = (block: unknown, path: string, depth: number): void => {
    if (!isRecord(block) || depth > MAX_WALK_DEPTH) {
      return;
    }

    const childKey = typeof block.type === "string" ? CHILD_BLOCK_KEYS.get(block.type) : undefined;
    if (childKey !== undefined) {
      const children = block[childKey];
      if (Array.isArray(children)) {
        children.forEach((child, i) => {
          visit(child, `${path}.${childKey}[${i}]`, depth + 1);
        });
      }
      return;
    }

    const seen = new Map<string, string>();
    for (const key of ELEMENT_KEYS) {
      const value = block[key];
      const entries: [string, unknown][] = Array.isArray(value)
        ? value.map((element, i) => [`${key}[${i}]`, element])
        : [[key, value]];
      for (const [rel, element] of entries) {
        if (!isRecord(element) || typeof element.action_id !== "string") {
          continue;
        }
        const id = element.action_id;
        const prev = seen.get(id);
        if (prev !== undefined) {
          errors.push(
            `${path}.${rel}.action_id must be unique within the block — '${id}' appears at ${prev} and ${rel}`,
          );
        } else {
          seen.set(id, rel);
        }
      }
    }
  };

  blocks.forEach((block, i) => {
    visit(block, `blocks[${i}]`, 0);
  });
  return errors;
}
