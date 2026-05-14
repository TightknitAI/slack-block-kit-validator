const CUMULATIVE_MARKDOWN_LIMIT = 12_000;

/**
 * Checks the cumulative character length across all `markdown` blocks in a
 * payload. Slack caps it at 12,000 chars per payload; the schema's per-block
 * `maxLength` can't express this across siblings.
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when under the limit)
 */
export function checkCumulativeMarkdownLength(blocks: readonly { type?: string; text?: string }[]): string[] {
  const total = blocks.reduce((sum, b) => {
    if (b?.type !== "markdown" || typeof b.text !== "string") {
      return sum;
    }
    return sum + b.text.length;
  }, 0);
  if (total > CUMULATIVE_MARKDOWN_LIMIT) {
    return [
      `cumulative markdown block text is ${total} chars — maximum across a payload is ${CUMULATIVE_MARKDOWN_LIMIT}`,
    ];
  }
  return [];
}
