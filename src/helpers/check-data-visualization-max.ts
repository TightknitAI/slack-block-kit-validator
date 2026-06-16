/**
 * Maximum number of `data_visualization` blocks Slack renders in a single
 * message. Additional ones beyond this cap are dropped.
 */
export const DATA_VISUALIZATION_MAX = 2;

/**
 * Checks that a payload contains at most {@link DATA_VISUALIZATION_MAX}
 * `data_visualization` blocks. Slack renders only the first two data
 * visualization blocks per message; any beyond that are silently dropped.
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when within the limit)
 */
export function checkDataVisualizationMax(blocks: readonly { type?: string }[]): string[] {
  const indices: number[] = [];
  blocks.forEach((block, i) => {
    if (block?.type === "data_visualization") {
      indices.push(i);
    }
  });
  if (indices.length > DATA_VISUALIZATION_MAX) {
    return [
      `at most ${DATA_VISUALIZATION_MAX} 'data_visualization' blocks are allowed per message — found ${indices.length} at indices ${indices.join(", ")}`,
    ];
  }
  return [];
}
