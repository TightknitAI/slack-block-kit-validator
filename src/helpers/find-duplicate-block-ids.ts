/**
 * Returns error messages describing any duplicate `block_id` values across the
 * given blocks array. Pairs with the JSON Schema (draft 2020-12) in this
 * package — JSON Schema can't express per-property uniqueness across items, so
 * this check sits alongside structural validation.
 *
 * Skips `markdown` blocks: Slack drops their `block_id` on send ("The block_id
 * is ignored in markdown blocks and will not be retained" per docs), so
 * duplicates involving markdown blocks are false positives from Slack's POV.
 * @param blocks - array of Block Kit blocks (or anything with an optional `block_id`)
 * @returns array of human-readable error messages (empty when no duplicates)
 */
export function findDuplicateBlockIds(blocks: readonly { type?: string; block_id?: string }[]): string[] {
  const seen = new Map<string, number>();
  const errors: string[] = [];
  blocks.forEach((block, i) => {
    const id = block?.block_id;
    if (id == null || block?.type === "markdown") {
      return;
    }
    const prev = seen.get(id);
    if (prev !== undefined) {
      errors.push(`blocks[${i}].block_id must be unique — '${id}' appears at index ${prev} and ${i}`);
    } else {
      seen.set(id, i);
    }
  });
  return errors;
}
