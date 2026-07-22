/**
 * Checks that a payload contains at most one `plan` block. Slack rejects
 * multi-plan payloads with `invalid_blocks` / "Cannot have more than 1 plan
 * block" (surfaced on e.g. `chat.update`).
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when zero or one `plan` block present)
 */
export function checkSinglePlanBlock(blocks: readonly { type?: string }[]): string[] {
  const indices: number[] = [];
  blocks.forEach((block, i) => {
    if (block?.type === "plan") {
      indices.push(i);
    }
  });
  if (indices.length > 1) {
    return [`only one 'plan' block is allowed per message — found ${indices.length} at indices ${indices.join(", ")}`];
  }
  return [];
}
