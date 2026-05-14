import type { Surface } from "./check-surface-compatibility";

type SelectLike = { type?: string; response_url_enabled?: boolean };
type BlockLike = {
  type?: string;
  accessory?: SelectLike;
  element?: SelectLike;
  elements?: SelectLike[];
};

const SELECT_TYPES_WITH_RESPONSE_URL = new Set(["conversations_select", "channels_select"]);

const hasResponseUrlEnabled = (node: SelectLike | undefined): boolean =>
  !!node &&
  node.response_url_enabled === true &&
  typeof node.type === "string" &&
  SELECT_TYPES_WITH_RESPONSE_URL.has(node.type);

/**
 * Enforces Slack's `response_url_enabled` restriction:
 * "This field only works with menus in input blocks in modals."
 * (Docs: conversations_select / channels_select elements.)
 *
 * Flags any usage on a non-modal surface, and any usage outside an `input`
 * block (e.g. as a section `accessory` or inside an `actions` block).
 * @param blocks - array of Block Kit blocks
 * @param surface - target surface (used to reject home/message usage)
 * @returns array of human-readable error messages (empty when valid)
 */
export function checkResponseUrlEnabledContext(blocks: readonly BlockLike[], surface: Surface | undefined): string[] {
  const errors: string[] = [];

  blocks.forEach((block, i) => {
    // Section accessory — never a valid host.
    if (hasResponseUrlEnabled(block.accessory)) {
      errors.push(
        `blocks[${i}].accessory sets response_url_enabled — only valid on select menus inside input blocks in modals`,
      );
    }
    // Actions block elements — never a valid host.
    if (Array.isArray(block.elements)) {
      block.elements.forEach((el, j) => {
        if (hasResponseUrlEnabled(el)) {
          errors.push(
            `blocks[${i}].elements[${j}] sets response_url_enabled — only valid on select menus inside input blocks in modals`,
          );
        }
      });
    }
    // Input block element — valid ONLY when surface is explicitly 'modal'.
    // An undefined surface means we have no confirmation this is a modal
    // payload, so we flag it conservatively rather than assume modal intent.
    if (block.type === "input" && hasResponseUrlEnabled(block.element) && surface !== "modal") {
      const surfaceLabel = surface ?? "unspecified";
      errors.push(
        `blocks[${i}].element sets response_url_enabled on surface '${surfaceLabel}' — only valid when surface is explicitly 'modal'`,
      );
    }
  });

  return errors;
}
