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
//
// Four entries below intentionally deviate from blocks.json — Slack's canonical
// data lists a surface where the block doesn't actually render. Each is
// empirically grounded:
//   • card / modals   — blocks.json lists Modals; fails to render there.
//   • file / messages — inbound-only; apps can't send it outbound at all
//     (https://docs.slack.dev/reference/block-kit/blocks/file-block:
//     "You can't add this block to app surfaces directly...").
//   • table / home tabs — blocks.json lists Home tabs; Tightknit testing shows
//     the table block renders on messages only (modals and home drop it).
//   • data_table / home tabs — same: blocks.json lists Home tabs, but as a
//     table-family block it inherits table's messages-only behavior (mirrored
//     for consistency, pending independent confirmation).
const BLOCKS_NOT_ALLOWED_IN_MESSAGE = new Set(["alert", "file"]);

const BLOCKS_NOT_ALLOWED_IN_MODAL = new Set([
  "card",
  "carousel",
  "container",
  "context_actions",
  "data_table",
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
  "data_table",
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
 * Element-level surface rules, keyed by element `type`. An element listed here
 * may only appear on the listed surfaces; unlisted elements (buttons, selects,
 * `plain_text_input`, ...) are allowed on every surface.
 *
 * Source of truth: the `available_in_surfaces` frontmatter on each element's
 * reference page under https://docs.slack.dev/reference/block-kit/block-elements
 * (fetched 2026-09-29).
 *
 * `email_text_input`, `number_input`, `url_text_input` and `rich_text_input`
 * are a known inconsistency in Slack's docs: their element pages list Modals
 * only (rich_text_input: Modals + Home tabs), while the input block that hosts
 * them (https://docs.slack.dev/reference/block-kit/blocks/input-block) lists
 * Messages, Modals and Home tabs. The element pages are the more
 * specific claim, so they win here. The validator has no warnings channel, so
 * these are reported as errors like every other rule; relax an entry if Slack
 * is shown to render the element on a surface its page omits.
 *
 * `feedback_buttons` and `icon_button` only live inside `context_actions`,
 * which is already forbidden outside messages, so their entries only fire if
 * that block rule is ever relaxed.
 */
const ELEMENT_SURFACES: ReadonlyMap<string, readonly Surface[]> = new Map<string, readonly Surface[]>([
  ["datetimepicker", ["message", "modal"]],
  ["email_text_input", ["modal"]],
  ["feedback_buttons", ["message"]],
  ["file_input", ["modal"]],
  ["icon_button", ["message"]],
  ["number_input", ["modal"]],
  ["rich_text_input", ["modal", "home"]],
  ["url_text_input", ["modal"]],
  ["workflow_button", ["message"]],
]);

/**
 * Block types that nest other blocks, mapped to the property holding them.
 * Surface rules apply to nested blocks exactly as they do at the top level.
 */
const CHILD_BLOCKS_KEY: ReadonlyMap<string, string> = new Map([
  ["container", "child_blocks"],
  ["carousel", "elements"],
]);

/**
 * Cap for recursive traversal of nested blocks. Slack only nests one level
 * (containers can't hold containers), so real payloads never come close.
 * Stop there to guard against adversarial or malformed inputs. Matches the
 * cap used in the other walkers (`check-focus-on-load-uniqueness`,
 * `check-number-input-bounds`).
 */
const MAX_WALK_DEPTH = 50;

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object";

const formatSurfaces = (surfaces: readonly Surface[]): string => surfaces.join(" and ");

/**
 * Reports any blocks or elements that are not allowed on the given surface.
 * Slack's surface compatibility matrix is documented at
 * https://docs.slack.dev/surfaces/.
 *
 * Block-level bans apply to top-level blocks and to blocks nested inside
 * `container.child_blocks` / `carousel.elements`. Element-level restrictions
 * (e.g. `file_input` only valid in modals) are checked wherever an
 * interactive element can live: `input.element`, `section.accessory`, and
 * `actions` / `context_actions` `elements`, at any nesting level.
 * @param blocks - array of Block Kit blocks
 * @param surface - target surface
 * @returns array of error messages (empty when all blocks are surface-compatible)
 */
export function checkSurfaceCompatibility(blocks: readonly unknown[], surface: Surface): string[] {
  const forbidden = FORBIDDEN_BY_SURFACE[surface];
  const errors: string[] = [];

  const maxBlocks = MAX_BLOCKS_BY_SURFACE[surface];
  if (blocks.length > maxBlocks) {
    errors.push(`surface '${surface}' allows at most ${maxBlocks} blocks (got ${blocks.length})`);
  }

  const checkElement = (element: unknown, path: string): void => {
    if (!isObject(element) || typeof element.type !== "string") {
      return;
    }
    const allowed = ELEMENT_SURFACES.get(element.type);
    if (allowed && !allowed.includes(surface)) {
      errors.push(
        `${path}.type '${element.type}' is only allowed in ${formatSurfaces(allowed)} surfaces (got '${surface}')`,
      );
    }
  };

  const checkBlock = (block: unknown, path: string, depth: number): void => {
    if (!isObject(block) || typeof block.type !== "string" || depth > MAX_WALK_DEPTH) {
      return;
    }
    const { type } = block;
    if (forbidden.has(type)) {
      errors.push(`${path}.type '${type}' is not allowed on surface '${surface}'`);
      // Block itself is already rejected — element-level and nested-block
      // errors would be redundant noise for the same misuse.
      return;
    }

    if (type === "input") {
      checkElement(block.element, `${path}.element`);
    } else if (type === "section") {
      checkElement(block.accessory, `${path}.accessory`);
    } else if ((type === "actions" || type === "context_actions") && Array.isArray(block.elements)) {
      block.elements.forEach((element, j) => {
        checkElement(element, `${path}.elements[${j}]`);
      });
    }

    const childKey = CHILD_BLOCKS_KEY.get(type);
    const children = childKey ? block[childKey] : undefined;
    if (Array.isArray(children)) {
      children.forEach((child, j) => {
        checkBlock(child, `${path}.${childKey}[${j}]`, depth + 1);
      });
    }
  };

  blocks.forEach((block, i) => {
    checkBlock(block, `blocks[${i}]`, 0);
  });

  return errors;
}
