/* eslint-disable */
// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
// Regenerate with: pnpm run generate:types
// Source: src/slack-block-kit.schema.json

/**
 * JSON Schema (draft 2020-12) for Slack Block Kit payloads. Validates a top-level array of blocks. Individual block, element, and composition object schemas are exposed via $defs for re-use. Compiled from https://docs.slack.dev/reference/block-kit (fetched 2026-04-16). Surface restrictions (messages vs modals vs home) and payload-level rules (e.g. cumulative 12k char markdown limit, single-table-per-message, max two data-visualization blocks per message) are documented in $defs descriptions but not enforced at the per-block level.
 */
export type SlackBlockKitPayload = [Block, ...Block[]] | ModalView | HomeView;
/**
 * Discriminated union of every Block Kit block type.
 */
export type Block =
  | ActionsBlock
  | AlertBlock
  | CardBlock
  | CarouselBlock
  | ContainerBlock
  | ContextActionsBlock
  | ContextBlock
  | DataTableBlock
  | DataVisualizationBlock
  | DividerBlock
  | FileBlock
  | HeaderBlock
  | ImageBlock
  | InputBlock
  | MarkdownBlock
  | PlanBlock
  | RichTextBlock
  | SectionBlock
  | TableBlock
  | TaskCardBlock
  | VideoBlock;
/**
 * Elements allowed inside an actions block.
 */
export type ActionsBlockElement =
  | ButtonElement
  | CheckboxesElement
  | DatepickerElement
  | DatetimepickerElement
  | TimepickerElement
  | OverflowElement
  | RadioButtonsElement
  | StaticSelectElement
  | ExternalSelectElement
  | UsersSelectElement
  | ConversationsSelectElement
  | ChannelsSelectElement
  | MultiStaticSelectElement
  | MultiExternalSelectElement
  | MultiUsersSelectElement
  | MultiConversationsSelectElement
  | MultiChannelsSelectElement
  | WorkflowButtonElement;
/**
 * An identifier for the interactive element. Should be unique among all action_ids used in a single view/message.
 */
export type ActionId = string;
export type StaticSelectElement = {
  type: "static_select";
  action_id?: ActionId;
  /**
   * @minItems 1
   * @maxItems 100
   */
  options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
  /**
   * @minItems 1
   * @maxItems 100
   */
  option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
  initial_option?: OptionObjectPlainText;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
} & StaticSelectElement1 & {
    type: "static_select";
    action_id?: ActionId;
    /**
     * @minItems 1
     * @maxItems 100
     */
    options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    /**
     * @minItems 1
     * @maxItems 100
     */
    option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
    initial_option?: OptionObjectPlainText;
    confirm?: ConfirmObject;
    focus_on_load?: boolean;
    placeholder?: PlaceholderObject;
  } & StaticSelectElement1 & {
    type: "static_select";
    action_id?: ActionId;
    /**
     * @minItems 1
     * @maxItems 100
     */
    options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    /**
     * @minItems 1
     * @maxItems 100
     */
    option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
    initial_option?: OptionObjectPlainText;
    confirm?: ConfirmObject;
    focus_on_load?: boolean;
    placeholder?: PlaceholderObject;
  } & StaticSelectElement1;
export type StaticSelectElement1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
export type MultiStaticSelectElement = {
  type: "multi_static_select";
  action_id?: ActionId;
  /**
   * @minItems 1
   * @maxItems 100
   */
  options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
  /**
   * @minItems 1
   * @maxItems 100
   */
  option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
  /**
   * @minItems 1
   */
  initial_options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
  confirm?: ConfirmObject;
  max_selected_items?: number;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
} & MultiStaticSelectElement1 & {
    type: "multi_static_select";
    action_id?: ActionId;
    /**
     * @minItems 1
     * @maxItems 100
     */
    options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    /**
     * @minItems 1
     * @maxItems 100
     */
    option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
    /**
     * @minItems 1
     */
    initial_options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    confirm?: ConfirmObject;
    max_selected_items?: number;
    focus_on_load?: boolean;
    placeholder?: PlaceholderObject;
  } & MultiStaticSelectElement1 & {
    type: "multi_static_select";
    action_id?: ActionId;
    /**
     * @minItems 1
     * @maxItems 100
     */
    options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    /**
     * @minItems 1
     * @maxItems 100
     */
    option_groups?: [OptionGroupObject, ...OptionGroupObject[]];
    /**
     * @minItems 1
     */
    initial_options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
    confirm?: ConfirmObject;
    max_selected_items?: number;
    focus_on_load?: boolean;
    placeholder?: PlaceholderObject;
  } & MultiStaticSelectElement1;
export type MultiStaticSelectElement1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
/**
 * A unique identifier for a block. Should be unique within a single message or view.
 */
export type BlockId = string;
/**
 * A text object — either plain_text or mrkdwn.
 */
export type TextObject = PlainTextObject | MrkdwnTextObject;
/**
 * At least one of hero_image, title, actions, or body is required.
 */
export type CardBlock = CardBlock1 & {
  type: "card";
  block_id?: BlockId;
  hero_image?: ImageElement;
  icon?: ImageElement;
  title?: TextObject;
  subtitle?: TextObject;
  body?: TextObject;
  /**
   * @minItems 1
   * @maxItems 2
   */
  actions?: [ButtonElement] | [ButtonElement, ButtonElement];
} & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  } & CardBlock1 & {
    type: "card";
    block_id?: BlockId;
    hero_image?: ImageElement;
    icon?: ImageElement;
    title?: TextObject;
    subtitle?: TextObject;
    body?: TextObject;
    /**
     * @minItems 1
     * @maxItems 2
     */
    actions?: [ButtonElement] | [ButtonElement, ButtonElement];
  };
export type CardBlock1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
/**
 * Must be used inside a section or context block. Either image_url or slack_file is required.
 */
export type ImageElement = {
  type: "image";
  alt_text: string;
  image_url?: string;
  slack_file?: SlackFileObject;
} & ImageElement1 & {
    type: "image";
    alt_text: string;
    image_url?: string;
    slack_file?: SlackFileObject;
  } & ImageElement1 & {
    type: "image";
    alt_text: string;
    image_url?: string;
    slack_file?: SlackFileObject;
  } & ImageElement1 & {
    type: "image";
    alt_text: string;
    image_url?: string;
    slack_file?: SlackFileObject;
  } & ImageElement1 & {
    type: "image";
    alt_text: string;
    image_url?: string;
    slack_file?: SlackFileObject;
  } & ImageElement1;
/**
 * Reference to a Slack file. Exactly one of url or id must be provided. Supported file types: png, jpg, jpeg, gif.
 */
export type SlackFileObject = {
  url?: string;
  id?: string;
} & SlackFileObject1 & {
    url?: string;
    id?: string;
  } & SlackFileObject1;
export type SlackFileObject1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
export type ImageElement1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
/**
 * A block allowed inside a container block's child_blocks array. Slack documents this set as: actions, context, divider, file, header, image, input, rich_text, section, table, video (https://docs.slack.dev/reference/block-kit/blocks/container-block). Notably excludes container itself (no nesting) and message-only chrome like card/carousel/markdown.
 */
export type ContainerChildBlock =
  | ActionsBlock
  | ContextBlock
  | DividerBlock
  | FileBlock
  | HeaderBlock
  | ImageBlock
  | InputBlock
  | RichTextBlock
  | SectionBlock
  | TableBlock
  | VideoBlock;
/**
 * Elements allowed inside a context block.
 */
export type ContextBlockElement = ImageElement | TextObject;
/**
 * Either image_url or slack_file is required (not both).
 */
export type ImageBlock = {
  type: "image";
  alt_text: string;
  image_url?: string;
  slack_file?: SlackFileObject;
  title?: PlainTextObject;
  block_id?: BlockId;
} & ImageBlock1 & {
    type: "image";
    alt_text: string;
    image_url?: string;
    slack_file?: SlackFileObject;
    title?: PlainTextObject;
    block_id?: BlockId;
  } & ImageBlock1;
export type ImageBlock1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
/**
 * Elements that may appear as the element of an input block.
 */
export type InputBlockElement =
  | PlainTextInputElement
  | EmailInputElement
  | UrlInputElement
  | NumberInputElement
  | CheckboxesElement
  | RadioButtonsElement
  | DatepickerElement
  | DatetimepickerElement
  | TimepickerElement
  | StaticSelectElement
  | ExternalSelectElement
  | UsersSelectElement
  | ConversationsSelectElement
  | ChannelsSelectElement
  | MultiStaticSelectElement
  | MultiExternalSelectElement
  | MultiUsersSelectElement
  | MultiConversationsSelectElement
  | MultiChannelsSelectElement
  | RichTextInputElement
  | FileInputElement;
/**
 * Any of the 4 rich-text container kinds usable inside a rich_text block's elements array.
 */
export type RichTextContainerElement =
  | RichTextSectionElement
  | RichTextListElement
  | RichTextPreformattedElement
  | RichTextQuoteElement;
/**
 * Any of the 10 rich-text leaf element kinds.
 */
export type RichTextLeaf =
  | RichTextTextLeaf
  | RichTextLinkLeaf
  | RichTextUserLeaf
  | RichTextUsergroupLeaf
  | RichTextTeamLeaf
  | RichTextChannelLeaf
  | RichTextEmojiLeaf
  | RichTextBroadcastLeaf
  | RichTextColorLeaf
  | RichTextDateLeaf;
/**
 * Must have text or fields (or both).
 */
export type SectionBlock = SectionBlock1 & {
  type: "section";
  text?: TextObject;
  block_id?: BlockId;
  /**
   * @minItems 1
   * @maxItems 10
   */
  fields?:
    | [TextObject]
    | [TextObject, TextObject]
    | [TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
    | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
    | [
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
        TextObject,
      ];
  accessory?: SectionAccessoryElement;
  expand?: boolean;
} & SectionBlock1 & {
    type: "section";
    text?: TextObject;
    block_id?: BlockId;
    /**
     * @minItems 1
     * @maxItems 10
     */
    fields?:
      | [TextObject]
      | [TextObject, TextObject]
      | [TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
      | [TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject, TextObject]
      | [
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
          TextObject,
        ];
    accessory?: SectionAccessoryElement;
    expand?: boolean;
  };
export type SectionBlock1 =
  | {
      [k: string]: unknown | undefined;
    }
  | {
      [k: string]: unknown | undefined;
    };
/**
 * Elements that may appear as the accessory of a section block. datetimepicker is intentionally excluded — docs say it 'must be used inside the actions block or input block'.
 */
export type SectionAccessoryElement =
  | ButtonElement
  | CheckboxesElement
  | DatepickerElement
  | TimepickerElement
  | ImageElement
  | OverflowElement
  | RadioButtonsElement
  | StaticSelectElement
  | ExternalSelectElement
  | UsersSelectElement
  | ConversationsSelectElement
  | ChannelsSelectElement
  | MultiStaticSelectElement
  | MultiExternalSelectElement
  | MultiUsersSelectElement
  | MultiConversationsSelectElement
  | MultiChannelsSelectElement
  | WorkflowButtonElement;
/**
 * A cell inside a table_block row. Either raw_text or rich_text.
 */
export type TableCell =
  | {
      type: "raw_text";
      text: string;
    }
  | {
      type: "rich_text";
      /**
       * Empty array is accepted by Slack (verified in Block Kit Builder 2026-04-16).
       */
      elements: RichTextContainerElement[];
    };
/**
 * Per-column settings inside table_block.column_settings. May be null to skip.
 */
export type TableColumnSetting = null | {
  align?: "left" | "center" | "right";
  is_wrapped?: boolean;
};
/**
 * Elements allowed inside a context_actions block.
 */
export type ContextActionsBlockElement = FeedbackButtonsElement | IconButtonElement;
/**
 * A cell inside a data_table_block row. `raw_text` / `raw_number` for simple values, `rich_text` for formatted content. Per https://docs.slack.dev/reference/block-kit/blocks/data-table-block. The docs' per-cell schemas list `properties` without a `required` array; we mirror `table_cell` and require the value-bearing field(s). The rule 'the first (header) row cannot contain rich_text cells' is a row-position constraint JSON Schema can't express and is not enforced here.
 */
export type DataTableCell =
  | {
      type: "raw_text";
      text: string;
    }
  | {
      type: "raw_number";
      value: number;
      text?: string;
    }
  | {
      type: "rich_text";
      elements: RichTextContainerElement[];
    };
/**
 * The chart rendered by a data_visualization block. line/bar/area charts use series + axis_config; pie charts use segments.
 */
export type DataVisualizationChart =
  | {
      type: "line" | "bar" | "area";
      /**
       * @minItems 1
       * @maxItems 6
       */
      series:
        | [DataVisualizationSeries]
        | [DataVisualizationSeries, DataVisualizationSeries]
        | [DataVisualizationSeries, DataVisualizationSeries, DataVisualizationSeries]
        | [DataVisualizationSeries, DataVisualizationSeries, DataVisualizationSeries, DataVisualizationSeries]
        | [
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
          ]
        | [
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
            DataVisualizationSeries,
          ];
      axis_config: DataVisualizationAxisConfig;
    }
  | {
      type: "pie";
      /**
       * @minItems 1
       * @maxItems 6
       */
      segments:
        | [DataVisualizationSegment]
        | [DataVisualizationSegment, DataVisualizationSegment]
        | [DataVisualizationSegment, DataVisualizationSegment, DataVisualizationSegment]
        | [DataVisualizationSegment, DataVisualizationSegment, DataVisualizationSegment, DataVisualizationSegment]
        | [
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
          ]
        | [
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
            DataVisualizationSegment,
          ];
    };

export interface ActionsBlock {
  type: "actions";
  /**
   * @minItems 1
   * @maxItems 25
   */
  elements: [ActionsBlockElement, ...ActionsBlockElement[]];
  block_id?: BlockId;
}
export interface ButtonElement {
  type: "button";
  text: PlainTextObject;
  action_id?: ActionId;
  url?: string;
  value?: string;
  style?: "primary" | "danger";
  confirm?: ConfirmObject;
  accessibility_label?: string;
}
export interface PlainTextObject {
  type: "plain_text";
  text: string;
  emoji?: boolean;
}
export interface ConfirmObject {
  title: PlainTextObject;
  /**
   * Per Slack docs examples, this field accepts plain_text OR mrkdwn. Prose on the docs page says plain_text, but the example payload uses mrkdwn.
   */
  text: PlainTextObject | MrkdwnTextObject;
  confirm: PlainTextObject;
  deny: PlainTextObject;
  style?: "primary" | "danger";
}
export interface MrkdwnTextObject {
  type: "mrkdwn";
  text: string;
  verbatim?: boolean;
}
export interface CheckboxesElement {
  type: "checkboxes";
  action_id?: ActionId;
  /**
   * @minItems 1
   * @maxItems 10
   */
  options:
    | [OptionObjectRadioOrCheckbox]
    | [OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox]
    | [OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ];
  /**
   * @minItems 1
   */
  initial_options?: [OptionObjectRadioOrCheckbox, ...OptionObjectRadioOrCheckbox[]];
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
}
/**
 * Option object used in radio_buttons and checkboxes elements. text and description may be plain_text or mrkdwn.
 */
export interface OptionObjectRadioOrCheckbox {
  text: PlainTextObject | MrkdwnTextObject;
  value: string;
  description?: PlainTextObject | MrkdwnTextObject;
}
export interface DatepickerElement {
  type: "datepicker";
  action_id?: ActionId;
  initial_date?: string;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * Reusable placeholder text object (plain_text only, max 150 chars).
 */
export interface PlaceholderObject {
  type: "plain_text";
  text: string;
  emoji?: boolean;
}
export interface DatetimepickerElement {
  type: "datetimepicker";
  action_id?: ActionId;
  initial_date_time?: number;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
}
export interface TimepickerElement {
  type: "timepicker";
  action_id?: ActionId;
  initial_time?: string;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
  timezone?: string;
}
/**
 * Must be used inside a section or actions block. Up to 5 options.
 */
export interface OverflowElement {
  type: "overflow";
  action_id?: ActionId;
  /**
   * @minItems 1
   * @maxItems 5
   */
  options:
    | [OptionObjectOverflow]
    | [OptionObjectOverflow, OptionObjectOverflow]
    | [OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow]
    | [OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow]
    | [OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow, OptionObjectOverflow];
  confirm?: ConfirmObject;
}
/**
 * Option object used in overflow menus. Adds optional url field.
 */
export interface OptionObjectOverflow {
  text: PlainTextObject;
  value: string;
  description?: PlainTextObject;
  url?: string;
}
export interface RadioButtonsElement {
  type: "radio_buttons";
  action_id?: ActionId;
  /**
   * @minItems 1
   * @maxItems 10
   */
  options:
    | [OptionObjectRadioOrCheckbox]
    | [OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox]
    | [OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox, OptionObjectRadioOrCheckbox]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ]
    | [
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
        OptionObjectRadioOrCheckbox,
      ];
  initial_option?: OptionObjectRadioOrCheckbox;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
}
/**
 * Option object used in select / multi-select menus. text and description must be plain_text. url is not allowed here (overflow only).
 */
export interface OptionObjectPlainText {
  text: PlainTextObject;
  value: string;
  description?: PlainTextObject;
}
export interface OptionGroupObject {
  label: PlainTextObject;
  /**
   * @minItems 1
   * @maxItems 100
   */
  options: [OptionObjectPlainText, ...OptionObjectPlainText[]];
}
export interface ExternalSelectElement {
  type: "external_select";
  action_id?: ActionId;
  initial_option?: OptionObjectPlainText;
  min_query_length?: number;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface UsersSelectElement {
  type: "users_select";
  action_id?: ActionId;
  initial_user?: string;
  confirm?: ConfirmObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * response_url_enabled is only valid when used inside an input block within a modal.
 */
export interface ConversationsSelectElement {
  type: "conversations_select";
  action_id?: ActionId;
  initial_conversation?: string;
  default_to_current_conversation?: boolean;
  confirm?: ConfirmObject;
  response_url_enabled?: boolean;
  filter?: ConversationFilterObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * Filter object for conversations_select / multi_conversations_select. At least one of include / exclude_external_shared_channels / exclude_bot_users must be present.
 */
export interface ConversationFilterObject {
  /**
   * @minItems 1
   */
  include?: ["im" | "mpim" | "private" | "public", ...("im" | "mpim" | "private" | "public")[]];
  exclude_external_shared_channels?: boolean;
  exclude_bot_users?: boolean;
}
/**
 * response_url_enabled is only valid when used inside an input block within a modal.
 */
export interface ChannelsSelectElement {
  type: "channels_select";
  action_id?: ActionId;
  initial_channel?: string;
  confirm?: ConfirmObject;
  response_url_enabled?: boolean;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface MultiExternalSelectElement {
  type: "multi_external_select";
  action_id?: ActionId;
  min_query_length?: number;
  /**
   * @minItems 1
   */
  initial_options?: [OptionObjectPlainText, ...OptionObjectPlainText[]];
  confirm?: ConfirmObject;
  max_selected_items?: number;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface MultiUsersSelectElement {
  type: "multi_users_select";
  action_id?: ActionId;
  /**
   * @minItems 1
   */
  initial_users?: [string, ...string[]];
  confirm?: ConfirmObject;
  max_selected_items?: number;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface MultiConversationsSelectElement {
  type: "multi_conversations_select";
  action_id?: ActionId;
  /**
   * @minItems 1
   */
  initial_conversations?: [string, ...string[]];
  default_to_current_conversation?: boolean;
  confirm?: ConfirmObject;
  max_selected_items?: number;
  filter?: ConversationFilterObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface MultiChannelsSelectElement {
  type: "multi_channels_select";
  action_id?: ActionId;
  /**
   * @minItems 1
   */
  initial_channels?: [string, ...string[]];
  confirm?: ConfirmObject;
  max_selected_items?: number;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface WorkflowButtonElement {
  type: "workflow_button";
  text: PlainTextObject;
  workflow: WorkflowObject;
  action_id: ActionId;
  style?: "primary" | "danger";
  accessibility_label?: string;
}
export interface WorkflowObject {
  trigger: TriggerObject;
}
export interface TriggerObject {
  url: string;
  customizable_input_parameters?: {
    name: string;
    value: unknown;
  }[];
}
export interface AlertBlock {
  type: "alert";
  text: TextObject;
  level?: "default" | "info" | "warning" | "error" | "success";
  block_id?: BlockId;
}
export interface CarouselBlock {
  type: "carousel";
  /**
   * @minItems 1
   * @maxItems 10
   */
  elements:
    | [CardBlock]
    | [CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock]
    | [CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock, CardBlock];
  block_id?: BlockId;
}
/**
 * A general-purpose wrapper that groups child blocks into a single, optionally collapsible unit with a configurable width. Messages only (https://docs.slack.dev/reference/block-kit/blocks/container-block). default_collapsed only takes effect when is_collapsible is true; the schema rejects default_collapsed: true without is_collapsible: true.
 */
export interface ContainerBlock {
  type: "container";
  block_id?: BlockId;
  title: PlainTextObject;
  subtitle?: PlainTextObject;
  icon?: ImageElement;
  width?: "narrow" | "standard" | "wide" | "full";
  is_collapsible?: boolean;
  default_collapsed?: boolean;
  /**
   * @minItems 1
   * @maxItems 10
   */
  child_blocks:
    | [ContainerChildBlock]
    | [ContainerChildBlock, ContainerChildBlock]
    | [ContainerChildBlock, ContainerChildBlock, ContainerChildBlock]
    | [ContainerChildBlock, ContainerChildBlock, ContainerChildBlock, ContainerChildBlock]
    | [ContainerChildBlock, ContainerChildBlock, ContainerChildBlock, ContainerChildBlock, ContainerChildBlock]
    | [
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
      ]
    | [
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
      ]
    | [
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
      ]
    | [
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
      ]
    | [
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
        ContainerChildBlock,
      ];
}
export interface ContextBlock {
  type: "context";
  /**
   * @minItems 1
   * @maxItems 10
   */
  elements:
    | [ContextBlockElement]
    | [ContextBlockElement, ContextBlockElement]
    | [ContextBlockElement, ContextBlockElement, ContextBlockElement]
    | [ContextBlockElement, ContextBlockElement, ContextBlockElement, ContextBlockElement]
    | [ContextBlockElement, ContextBlockElement, ContextBlockElement, ContextBlockElement, ContextBlockElement]
    | [
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
      ]
    | [
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
      ]
    | [
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
      ]
    | [
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
      ]
    | [
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
        ContextBlockElement,
      ];
  block_id?: BlockId;
}
export interface DividerBlock {
  type: "divider";
  block_id?: BlockId;
}
/**
 * Cannot be added to app surfaces directly; surfaces only when retrieving messages that contain remote files.
 */
export interface FileBlock {
  type: "file";
  external_id: string;
  source: "remote";
  block_id?: BlockId;
}
export interface HeaderBlock {
  type: "header";
  text: PlainTextObject;
  block_id?: BlockId;
  level?: number;
}
/**
 * If element is a file_input, dispatch_action must not be true.
 */
export interface InputBlock {
  type: "input";
  label: PlainTextObject;
  element: InputBlockElement;
  dispatch_action?: boolean;
  block_id?: BlockId;
  hint?: PlainTextObject;
  optional?: boolean;
}
/**
 * Must be used inside an input block.
 */
export interface PlainTextInputElement {
  type: "plain_text_input";
  action_id?: ActionId;
  initial_value?: string;
  multiline?: boolean;
  min_length?: number;
  max_length?: number;
  dispatch_action_config?: DispatchActionConfigObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface DispatchActionConfigObject {
  /**
   * @minItems 1
   * @maxItems 2
   */
  trigger_actions_on:
    | ["on_enter_pressed" | "on_character_entered"]
    | ["on_enter_pressed" | "on_character_entered", "on_enter_pressed" | "on_character_entered"];
}
/**
 * Must be used inside an input block.
 */
export interface EmailInputElement {
  type: "email_text_input";
  action_id?: ActionId;
  initial_value?: string;
  dispatch_action_config?: DispatchActionConfigObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * Must be used inside an input block.
 */
export interface UrlInputElement {
  type: "url_text_input";
  action_id?: ActionId;
  initial_value?: string;
  dispatch_action_config?: DispatchActionConfigObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * Must be used inside an input block. min_value must not exceed max_value.
 */
export interface NumberInputElement {
  type: "number_input";
  is_decimal_allowed: boolean;
  action_id?: ActionId;
  initial_value?: string;
  min_value?: string;
  max_value?: string;
  dispatch_action_config?: DispatchActionConfigObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
/**
 * Must be used inside an input block.
 */
export interface RichTextInputElement {
  type: "rich_text_input";
  action_id: ActionId;
  initial_value?: RichTextBlock;
  dispatch_action_config?: DispatchActionConfigObject;
  focus_on_load?: boolean;
  placeholder?: PlaceholderObject;
}
export interface RichTextBlock {
  type: "rich_text";
  /**
   * Empty array is accepted by Slack (verified in Block Kit Builder 2026-04-16).
   */
  elements: RichTextContainerElement[];
  block_id?: BlockId;
}
export interface RichTextSectionElement {
  type: "rich_text_section";
  /**
   * Empty array is accepted by Slack (verified in Block Kit Builder 2026-04-16).
   */
  elements: RichTextLeaf[];
}
export interface RichTextTextLeaf {
  type: "text";
  text: string;
  style?: RichTextStyleObject;
}
/**
 * Style flags for rich-text leaf elements. Slack docs disagree on which flags are allowed per leaf type; this is the union of all flags documented.
 */
export interface RichTextStyleObject {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  highlight?: boolean;
  client_highlight?: boolean;
  unlink?: boolean;
}
export interface RichTextLinkLeaf {
  type: "link";
  url: string;
  text?: string;
  unsafe?: boolean;
  style?: RichTextStyleObject;
}
export interface RichTextUserLeaf {
  type: "user";
  user_id: string;
  style?: RichTextStyleObject;
}
export interface RichTextUsergroupLeaf {
  type: "usergroup";
  usergroup_id: string;
  style?: RichTextStyleObject;
}
/**
 * Whole-team mention (e.g. <!T12345>) — referenced by team_id.
 */
export interface RichTextTeamLeaf {
  type: "team";
  team_id: string;
  style?: RichTextStyleObject;
}
export interface RichTextChannelLeaf {
  type: "channel";
  channel_id: string;
  style?: RichTextStyleObject;
}
/**
 * Slack's official docs (rich-text-block reference) only list type/name/unicode, but the API silently accepts a `style` object on emoji leaves. We allow it to match observed behavior.
 */
export interface RichTextEmojiLeaf {
  type: "emoji";
  name: string;
  skin_tone?: number;
  unicode?: string;
  style?: RichTextStyleObject;
}
export interface RichTextBroadcastLeaf {
  type: "broadcast";
  range: "here" | "channel" | "everyone";
  style?: RichTextStyleObject;
}
export interface RichTextColorLeaf {
  type: "color";
  value: string;
  style?: RichTextStyleObject;
}
export interface RichTextDateLeaf {
  type: "date";
  timestamp: number;
  format: string;
  url?: string;
  fallback?: string;
  style?: RichTextStyleObject;
}
export interface RichTextListElement {
  type: "rich_text_list";
  style: "bullet" | "ordered";
  /**
   * @minItems 1
   */
  elements: [RichTextSectionElement, ...RichTextSectionElement[]];
  indent?: number;
  offset?: number;
  border?: 0 | 1;
}
export interface RichTextPreformattedElement {
  type: "rich_text_preformatted";
  /**
   * Empty array is accepted by Slack (verified in Block Kit Builder 2026-04-16).
   */
  elements: RichTextLeaf[];
  border?: 0 | 1;
  language?: string;
}
export interface RichTextQuoteElement {
  type: "rich_text_quote";
  /**
   * Empty array is accepted by Slack (verified in Block Kit Builder 2026-04-16).
   */
  elements: RichTextLeaf[];
  border?: 0 | 1;
}
/**
 * Must be used inside an input block in modals only. Requires files:read OAuth scope. 10MB per-file limit (not enforceable in JSON Schema).
 */
export interface FileInputElement {
  type: "file_input";
  action_id?: ActionId;
  /**
   * @minItems 1
   */
  filetypes?: [string, ...string[]];
  max_files?: number;
}
/**
 * One table per message (server-enforced via invalid_attachments / only_one_table_allowed). Up to 100 rows, up to 20 cells per row.
 */
export interface TableBlock {
  type: "table";
  block_id?: BlockId;
  /**
   * @minItems 1
   * @maxItems 100
   */
  rows: [
    (
      | [TableCell]
      | [TableCell, TableCell]
      | [TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
    ),
    ...(
      | [TableCell]
      | [TableCell, TableCell]
      | [TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell, TableCell]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
      | [
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
          TableCell,
        ]
    )[],
  ];
  /**
   * @maxItems 20
   */
  column_settings?:
    | []
    | [TableColumnSetting]
    | [TableColumnSetting, TableColumnSetting]
    | [TableColumnSetting, TableColumnSetting, TableColumnSetting]
    | [TableColumnSetting, TableColumnSetting, TableColumnSetting, TableColumnSetting]
    | [TableColumnSetting, TableColumnSetting, TableColumnSetting, TableColumnSetting, TableColumnSetting]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ]
    | [
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
        TableColumnSetting,
      ];
}
/**
 * Requires links.embed:write OAuth scope. video_url must be in app's unfurl domains, HTTPS, embeddable, return 2xx, not point to Slack-related domains.
 */
export interface VideoBlock {
  type: "video";
  alt_text: string;
  title: PlainTextObject;
  thumbnail_url: string;
  video_url: string;
  author_name?: string;
  description?: PlainTextObject;
  provider_icon_url?: string;
  provider_name?: string;
  title_url?: string;
  block_id?: BlockId;
}
export interface ContextActionsBlock {
  type: "context_actions";
  /**
   * @minItems 1
   * @maxItems 5
   */
  elements:
    | [ContextActionsBlockElement]
    | [ContextActionsBlockElement, ContextActionsBlockElement]
    | [ContextActionsBlockElement, ContextActionsBlockElement, ContextActionsBlockElement]
    | [ContextActionsBlockElement, ContextActionsBlockElement, ContextActionsBlockElement, ContextActionsBlockElement]
    | [
        ContextActionsBlockElement,
        ContextActionsBlockElement,
        ContextActionsBlockElement,
        ContextActionsBlockElement,
        ContextActionsBlockElement,
      ];
  block_id?: BlockId;
}
/**
 * Must be used inside a context_actions block.
 */
export interface FeedbackButtonsElement {
  type: "feedback_buttons";
  positive_button: FeedbackButtonSubobject;
  negative_button: FeedbackButtonSubobject;
  action_id?: ActionId;
}
export interface FeedbackButtonSubobject {
  text: PlainTextObject;
  value: string;
  accessibility_label?: string;
}
/**
 * Icon button — only valid inside a context_actions block.
 */
export interface IconButtonElement {
  type: "icon_button";
  icon: "trash";
  text: PlainTextObject;
  action_id?: ActionId;
  value?: string;
  confirm?: ConfirmObject;
  accessibility_label?: string;
  visible_to_user_ids?: string[];
}
/**
 * Rich, interactive table with pagination, sorting, and filtering (https://docs.slack.dev/reference/block-kit/blocks/data-table-block). Distinct from `table_block`, which is a simpler static table. The single-table and aggregate 10,000-character limits are payload-level rules not enforced here. `row_header_column_index` must point at an existing column, a cross-field rule JSON Schema can't check (bounded to 0–19 since a row has at most 20 cells).
 */
export interface DataTableBlock {
  type: "data_table";
  block_id?: BlockId;
  caption: string;
  page_size?: number;
  row_header_column_index?: number;
  /**
   * First row is the header; 2–101 rows total (1 header + 1–100 data rows), 1–20 cells per row.
   *
   * @minItems 2
   * @maxItems 101
   */
  rows: [
    (
      | [DataTableCell]
      | [DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
    ),
    (
      | [DataTableCell]
      | [DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
    ),
    ...(
      | [DataTableCell]
      | [DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell, DataTableCell]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
      | [
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
          DataTableCell,
        ]
    )[],
  ];
}
/**
 * Renders data as a line, bar, area, or pie chart. Messages only (https://docs.slack.dev/reference/block-kit/blocks/data-visualization-block). Slack renders at most two data_visualization blocks per message (enforced via the checkDataVisualizationMax helper, since JSON Schema can't count sibling blocks). Two further runtime rules are enforced via checkDataVisualizationConsistency, since they depend on sibling-field values JSON Schema can't compare: series names must be unique within a chart, and each series must contain exactly one data point per axis_config.categories label.
 */
export interface DataVisualizationBlock {
  type: "data_visualization";
  block_id?: BlockId;
  title: string;
  chart: DataVisualizationChart;
}
/**
 * A named series of data points plotted on a line/bar/area chart. The name drives the chart legend and must be unique across all series in the same chart (enforced via checkDataVisualizationConsistency).
 */
export interface DataVisualizationSeries {
  name: string;
  /**
   * @minItems 1
   * @maxItems 20
   */
  data:
    | [DataVisualizationDataPoint]
    | [DataVisualizationDataPoint, DataVisualizationDataPoint]
    | [DataVisualizationDataPoint, DataVisualizationDataPoint, DataVisualizationDataPoint]
    | [DataVisualizationDataPoint, DataVisualizationDataPoint, DataVisualizationDataPoint, DataVisualizationDataPoint]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ]
    | [
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
        DataVisualizationDataPoint,
      ];
}
/**
 * A single point in a chart series: an x-axis label and its numeric value. The label must match one of axis_config.categories (enforced via checkDataVisualizationConsistency). Negative values are permitted — line/bar/area charts render against a zero baseline.
 */
export interface DataVisualizationDataPoint {
  label: string;
  value: number;
}
/**
 * Axis configuration for cartesian (line/bar/area) charts. categories define the valid x-axis labels and their left-to-right display order. At most 20 categories — each series must carry exactly one data point per category, and a series' data array is itself capped at 20 items.
 */
export interface DataVisualizationAxisConfig {
  /**
   * @maxItems 20
   */
  categories:
    | []
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string, string, string, string, string]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]
    | [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ];
  x_label?: string;
  y_label?: string;
}
/**
 * A single slice of a pie chart. value must be greater than 0; Slack derives the displayed percentage from each segment's value as a share of the total.
 */
export interface DataVisualizationSegment {
  label: string;
  value: number;
}
/**
 * block_id is ignored on markdown blocks. Cumulative 12,000-char limit across all markdown blocks in one payload is a payload-level rule, not enforced here.
 */
export interface MarkdownBlock {
  type: "markdown";
  text: string;
  block_id?: BlockId;
}
export interface PlanBlock {
  type: "plan";
  title: string | PlainTextObject;
  block_id?: BlockId;
  tasks?: TaskCardInlineObject[];
}
/**
 * A task card as it appears inline within a plan_block tasks array — the docs' example omits the type discriminator.
 */
export interface TaskCardInlineObject {
  type?: "task_card";
  task_id: string;
  title: string;
  details?: RichTextBlock;
  output?: RichTextBlock;
  sources?: UrlSourceElement[];
  status?: "pending" | "in_progress" | "complete" | "error";
  block_id?: BlockId;
}
/**
 * URL source element — only valid inside a task_card block's sources array.
 */
export interface UrlSourceElement {
  type: "url";
  url: string;
  text: string;
}
/**
 * Standalone task_card block (also embeddable inline within plan_block).
 */
export interface TaskCardBlock {
  type: "task_card";
  task_id: string;
  title: string;
  details?: RichTextBlock;
  output?: RichTextBlock;
  sources?: UrlSourceElement[];
  status?: "pending" | "in_progress" | "complete" | "error";
  block_id?: BlockId;
}
/**
 * Modal view surface (views.open / views.push / views.update payload). title/submit/close text capped at 24 chars. When blocks contain any input block, submit is required (per docs).
 */
export interface ModalView {
  type: "modal";
  title: PlainTextObject;
  /**
   * @minItems 1
   * @maxItems 100
   */
  blocks: [Block, ...Block[]];
  close?: PlainTextObject;
  submit?: PlainTextObject;
  private_metadata?: string;
  callback_id?: string;
  clear_on_close?: boolean;
  notify_on_close?: boolean;
  external_id?: string;
  submit_disabled?: boolean;
}
/**
 * Home tab view surface (views.publish payload).
 */
export interface HomeView {
  type: "home";
  /**
   * @minItems 1
   * @maxItems 100
   */
  blocks: [Block, ...Block[]];
  private_metadata?: string;
  callback_id?: string;
  external_id?: string;
}
