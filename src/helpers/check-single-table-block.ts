import type { Surface } from "./check-surface-compatibility.js";

/** Block types that count toward Slack's one-table-per-message limit. */
const TABLE_FAMILY = new Set(["table", "data_table"]);

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object";

const isTableFamily = (block: unknown): boolean =>
  isObject(block) && typeof block.type === "string" && TABLE_FAMILY.has(block.type);

/**
 * Checks that a message contains at most one table-family block (`table` or
 * `data_table`), counting tables nested in `container.child_blocks` too.
 * Slack rejects multi-table messages with `invalid_attachments` /
 * `only_one_table_allowed`; `data_table` is the same family and shares the
 * limit (per Slack's slackapi/slack-skills-plugin guidance).
 *
 * The limit is a message-posting rule, so it only runs when `surface` is
 * `message` or unspecified. On `modal` / `home` every table is already
 * rejected by `checkSurfaceCompatibility`, and a second "per message" error
 * would only repeat that with misleading wording.
 * @param blocks - array of Block Kit blocks
 * @param surface - target surface; the check is skipped for `modal` and `home`
 * @returns array of error messages (empty when zero or one table-family block present)
 */
export function checkSingleTableBlock(blocks: readonly unknown[], surface?: Surface): string[] {
  if (surface === "modal" || surface === "home") {
    return [];
  }
  const paths: string[] = [];
  blocks.forEach((block, i) => {
    if (isTableFamily(block)) {
      paths.push(`blocks[${i}]`);
      return;
    }
    // Containers hold one level of child blocks (they can't nest), so a
    // single-level descent covers every place a table can live.
    if (isObject(block) && block.type === "container" && Array.isArray(block.child_blocks)) {
      block.child_blocks.forEach((child, j) => {
        if (isTableFamily(child)) {
          paths.push(`blocks[${i}].child_blocks[${j}]`);
        }
      });
    }
  });
  if (paths.length > 1) {
    return [
      `only one 'table' or 'data_table' block is allowed per message — found ${paths.length} at ${paths.join(", ")}`,
    ];
  }
  return [];
}
