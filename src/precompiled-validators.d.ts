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
export const blockValidators: Readonly<Record<"actions" | "alert" | "auth_provider" | "card" | "carousel" | "container" | "context" | "context_actions" | "data_table" | "data_visualization" | "divider" | "file" | "header" | "image" | "input" | "layout" | "markdown" | "plan" | "rich_text" | "section" | "table" | "task_card" | "video", StandaloneValidateFunction>>;
/** Per-element-type validators, keyed by an element's `type`. */
export const elementValidators: Readonly<Record<"action_cell" | "broadcast" | "button" | "channel" | "channels_select" | "checkboxes" | "color" | "conversations_select" | "date" | "datepicker" | "datetimepicker" | "email_text_input" | "emoji" | "external_select" | "feedback_buttons" | "file_input" | "icon_button" | "image" | "link" | "mrkdwn" | "multi_channels_select" | "multi_conversations_select" | "multi_external_select" | "multi_static_select" | "multi_users_select" | "number_input" | "overflow" | "plain_text" | "plain_text_input" | "radio_buttons" | "raw_number" | "raw_text" | "rich_text" | "rich_text_input" | "rich_text_list" | "rich_text_preformatted" | "rich_text_quote" | "rich_text_section" | "static_select" | "task_card" | "team" | "text" | "timepicker" | "url" | "url_text_input" | "user" | "usergroup" | "users_select" | "workflow_button", StandaloneValidateFunction>>;
