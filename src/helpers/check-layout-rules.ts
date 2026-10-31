/**
 * Blocks that hold other blocks and count toward Slack's nesting limit. Per
 * https://docs.slack.dev/reference/block-kit/blocks/layout-block, layout and
 * container nest in each other at most two levels deep: `layout > container >
 * rich_text` is valid, `layout > container > layout > rich_text` is not.
 */
const MAX_NESTING = 2;

/** Blocks that can't share a layout row with one another. */
const LARGE_BLOCKS = new Set(["carousel", "data_table", "data_visualization"]);

const WIDTH_WEIGHT: Record<string, number> = { narrow: 1, standard: 2, wide: 3 };

/** Guards against adversarial payloads; real nesting never passes MAX_NESTING. */
const MAX_WALK_DEPTH = 50;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Yields each block nested directly inside a layout (`rows[].items[].block`)
 * or container (`child_blocks[]`), with its path relative to the parent.
 * @param block - a layout or container block
 * @returns `[child, relativePath]` pairs
 */
export const nestedBlocks = (block: Record<string, unknown>): [unknown, string][] => {
  const children: [unknown, string][] = [];
  if (block.type === "layout" && Array.isArray(block.rows)) {
    block.rows.forEach((row, r) => {
      if (isRecord(row) && Array.isArray(row.items)) {
        row.items.forEach((item, i) => {
          if (isRecord(item)) {
            children.push([item.block, `.rows[${r}].items[${i}].block`]);
          }
        });
      }
    });
  } else if (block.type === "container" && Array.isArray(block.child_blocks)) {
    block.child_blocks.forEach((child, i) => {
      children.push([child, `.child_blocks[${i}]`]);
    });
  }
  return children;
};

const checkRow = (row: unknown, path: string, errors: string[]): void => {
  if (!isRecord(row) || !Array.isArray(row.items)) {
    return;
  }
  const items = row.items.filter(isRecord);
  const typeOf = (item: Record<string, unknown>) => (isRecord(item.block) ? item.block.type : undefined);

  const large = items.filter((item) => LARGE_BLOCKS.has(typeOf(item) as string));
  if (large.length > 1) {
    errors.push(
      `${path}: carousel, data_table and data_visualization blocks can't share a layout row (found ${large
        .map(typeOf)
        .join(", ")})`,
    );
  }

  const weight = (item: Record<string, unknown>) =>
    WIDTH_WEIGHT[typeof item.width === "string" ? item.width : "standard"] ?? WIDTH_WEIGHT.standard;
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  items.forEach((item, i) => {
    if (typeOf(item) === "data_visualization" && weight(item) * 2 <= total) {
      errors.push(`${path}.items[${i}]: a data_visualization block needs more than half of its layout row's width`);
    }
  });
};

/**
 * Checks the layout block rules JSON Schema can't express: layout and
 * container nest at most two levels deep, carousel / data_table /
 * data_visualization don't share a row, and a data_visualization item takes
 * more than half of its row's width weight (narrow 1, standard 2, wide 3).
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when every layout follows the rules)
 */
export function checkLayoutRules(blocks: readonly unknown[]): string[] {
  const errors: string[] = [];

  const visit = (block: unknown, path: string, nesting: number, depth: number): void => {
    if (!isRecord(block) || depth > MAX_WALK_DEPTH) {
      return;
    }
    if (block.type !== "layout" && block.type !== "container") {
      return;
    }
    const level = nesting + 1;
    if (level > MAX_NESTING) {
      errors.push(
        `${path}: layout and container blocks can nest at most ${MAX_NESTING} levels deep (this ${block.type} is level ${level})`,
      );
      return;
    }
    if (block.type === "layout" && Array.isArray(block.rows)) {
      block.rows.forEach((row, r) => {
        checkRow(row, `${path}.rows[${r}]`, errors);
      });
    }
    for (const [child, childPath] of nestedBlocks(block)) {
      visit(child, `${path}${childPath}`, level, depth + 1);
    }
  };

  blocks.forEach((block, i) => {
    visit(block, `blocks[${i}]`, 0, 0);
  });
  return errors;
}
