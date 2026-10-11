// AUTO-GENERATED — DO NOT EDIT BY HAND.

export type StandaloneValidateFunction = ((data: unknown) => boolean) & {
  errors?:
    | {
        instancePath: string;
        schemaPath: string;
        keyword: string;
        params: Record<string, unknown>;
        message?: string;
      }[]
    | null;
};

/** Validates a bare blocks array. */
export const validateBlocks: StandaloneValidateFunction;
/** Validates a modal view envelope. */
export const validateModal: StandaloneValidateFunction;
/** Validates a home view envelope. */
export const validateHome: StandaloneValidateFunction;
/** Per-block-type validators, keyed by `block.type`. */
export const blockValidators: Readonly<Record<"actions" | "alert" | "card" | "carousel" | "container" | "context" | "context_actions" | "data_table" | "data_visualization" | "divider" | "file" | "header" | "image" | "input" | "markdown" | "plan" | "rich_text" | "section" | "table" | "task_card" | "video", StandaloneValidateFunction>>;
