/**
 * Checks that a payload contains at most one `table` block. Slack rejects
 * multi-table messages with `invalid_attachments` / `only_one_table_allowed`.
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when zero or one `table` block present)
 */
export function checkSingleTableBlock(blocks: readonly { type?: string }[]): string[] {
  const indices: number[] = [];
  blocks.forEach((block, i) => {
    if (block?.type === "table") {
      indices.push(i);
    }
  });
  if (indices.length > 1) {
    return [`only one 'table' block is allowed per message — found ${indices.length} at indices ${indices.join(", ")}`];
  }
  return [];
}
