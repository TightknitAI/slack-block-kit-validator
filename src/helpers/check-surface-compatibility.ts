/**
 * Surfaces where Block Kit payloads are rendered. Each has a different set of
 * blocks/elements it accepts.
 */
export type Surface = "message" | "modal" | "home";

// Source of truth: https://docs.slack.dev/blocks.json — the canonical JSON
// that powers the "Surfaces" column on each block's reference page. Every
// block entry there has an `available-in-surfaces` array valued with some
// subset of ["Modals", "Messages", "Home tabs"]. Whatever's missing from
// that array is what we forbid here.
// `file` is only produced by Slack when retrieving messages that contain
// remote files; apps cannot send it outbound on any surface
// (https://docs.slack.dev/reference/block-kit/blocks/file-block:
// "You can't add this block to app surfaces directly...").
const BLOCKS_NOT_ALLOWED_IN_MESSAGE = new Set(["alert", "file"]);

// carousel/card are listed as modal-available in Slack's blocks.json but
// empirically fail to render inside modal views — confirmed by the PR author
// against the live API. They work in messages and home tabs.
// `data_visualization` is a messages-only block — its reference page lists
// "Available in Surfaces: Messages" only
// (https://docs.slack.dev/reference/block-kit/blocks/data-visualization-block).
// Forbidden in both modals and home tabs.
const BLOCKS_NOT_ALLOWED_IN_MODAL = new Set([
  "card",
  "carousel",
  "context_actions",
  "data_visualization",
  "file",
  "markdown",
  "plan",
  "table",
  "task_card",
]);

const BLOCKS_NOT_ALLOWED_IN_HOME = new Set([
  "alert",
  "context_actions",
  "data_visualization",
  "file",
  "markdown",
  "plan",
  "table",
  "task_card",
]);

const FORBIDDEN_BY_SURFACE: Record<Surface, Set<string>> = {
  message: BLOCKS_NOT_ALLOWED_IN_MESSAGE,
  modal: BLOCKS_NOT_ALLOWED_IN_MODAL,
  home: BLOCKS_NOT_ALLOWED_IN_HOME,
};

/**
 * Per-surface block-count caps. Per
 * https://docs.slack.dev/reference/block-kit/blocks:
 * "You can include up to 50 blocks in each message, and 100 blocks in modals
 * or Home tabs." The top-level schema enforces the looser 100 cap
 * unconditionally so that modal/home payloads validate; the stricter message
 * cap is applied here once the surface is known.
 */
const MAX_BLOCKS_BY_SURFACE: Record<Surface, number> = {
  message: 50,
  modal: 100,
  home: 100,
};

/**
 * Reports any blocks whose type is not allowed on the given surface. Slack's
 * surface compatibility matrix is documented at
 * https://docs.slack.dev/surfaces/. Element-level restrictions (e.g. `file_input`
 * only valid in modals) are checked here by looking at each input block's inner
 * `element.type`.
 * @param blocks - array of Block Kit blocks
 * @param surface - target surface
 * @returns array of error messages (empty when all blocks are surface-compatible)
 */
export function checkSurfaceCompatibility(
  blocks: readonly { type?: string; element?: { type?: string } }[],
  surface: Surface,
): string[] {
  const forbidden = FORBIDDEN_BY_SURFACE[surface];
  const errors: string[] = [];

  const maxBlocks = MAX_BLOCKS_BY_SURFACE[surface];
  if (blocks.length > maxBlocks) {
    errors.push(`surface '${surface}' allows at most ${maxBlocks} blocks (got ${blocks.length})`);
  }

  blocks.forEach((block, i) => {
    if (block?.type && forbidden.has(block.type)) {
      errors.push(`blocks[${i}].type '${block.type}' is not allowed on surface '${surface}'`);
      // Block itself is already rejected — element-level errors would be
      // redundant noise for the same misuse.
      return;
    }
    if (block?.type === "input" && block.element?.type === "file_input" && surface !== "modal") {
      errors.push(`blocks[${i}].element.type 'file_input' is only allowed in modal surfaces (got '${surface}')`);
    }
  });

  return errors;
}
