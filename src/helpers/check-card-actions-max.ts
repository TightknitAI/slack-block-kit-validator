/**
 * Maximum number of action buttons allowed inside a single `card` block.
 */
export const CARD_ACTIONS_MAX = 2;

/**
 * Checks that every `card` block contains at most {@link CARD_ACTIONS_MAX}
 * action buttons. Slack's card surface only renders up to two action buttons
 * in the action row; additional buttons are clipped or rejected.
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when no card exceeds the limit)
 */
export function checkCardActionsMax(blocks: readonly { type?: string; actions?: readonly unknown[] }[]): string[] {
  const errors: string[] = [];
  blocks.forEach((block, i) => {
    if (block?.type !== "card") {
      return;
    }
    const actions = block.actions;
    if (Array.isArray(actions) && actions.length > CARD_ACTIONS_MAX) {
      errors.push(
        `blocks[${i}].actions card blocks allow at most ${CARD_ACTIONS_MAX} action buttons — found ${actions.length}`,
      );
    }
  });
  return errors;
}
