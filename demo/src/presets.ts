import type { Surface, ValidationTarget } from "@tightknitai/slack-block-kit-validator";

export interface Preset {
  id: string;
  label: string;
  /** Hint for chip styling — invalid presets render in red. */
  tone?: "valid" | "invalid";
  target: ValidationTarget;
  surface?: Surface;
  json: string;
}

const helloWorld = JSON.stringify(
  [
    {
      type: "header",
      text: { type: "plain_text", text: "Daily standup" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Yesterday:* shipped the block kit validator.\n*Today:* writing a live demo.",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Approve" },
          style: "primary",
          action_id: "approve",
          value: "approve",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Dismiss" },
          action_id: "dismiss",
          value: "dismiss",
        },
      ],
    },
  ],
  null,
  2,
);

const modalView = JSON.stringify(
  {
    type: "modal",
    callback_id: "feedback_modal",
    title: { type: "plain_text", text: "Share feedback" },
    submit: { type: "plain_text", text: "Send" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "summary",
        label: { type: "plain_text", text: "Summary" },
        element: {
          type: "plain_text_input",
          action_id: "summary_input",
          focus_on_load: true,
        },
      },
      {
        type: "input",
        block_id: "rating",
        label: { type: "plain_text", text: "Rating" },
        element: {
          type: "static_select",
          action_id: "rating_select",
          placeholder: { type: "plain_text", text: "Pick one" },
          options: [
            { text: { type: "plain_text", text: "Great" }, value: "great" },
            { text: { type: "plain_text", text: "Mid" }, value: "mid" },
            { text: { type: "plain_text", text: "Rough" }, value: "rough" },
          ],
        },
      },
    ],
  },
  null,
  2,
);

const duplicateBlockIds = JSON.stringify(
  [
    {
      type: "section",
      block_id: "row",
      text: { type: "mrkdwn", text: "First row" },
    },
    {
      type: "section",
      block_id: "row",
      text: { type: "mrkdwn", text: "Second row — same block_id" },
    },
    {
      type: "divider",
      block_id: "row",
    },
  ],
  null,
  2,
);

const markdownOnModal = JSON.stringify(
  [
    {
      type: "section",
      text: { type: "plain_text", text: "Pick a plan:" },
    },
    {
      type: "markdown",
      text: "**Pro** — $29/mo. Unlimited seats, priority support.",
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Choose Pro" },
          action_id: "choose_pro",
          value: "pro",
        },
      ],
    },
  ],
  null,
  2,
);

const twoTables = JSON.stringify(
  [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Q1 results*" },
    },
    {
      type: "table",
      rows: [
        [
          { type: "raw_text", text: "Metric" },
          { type: "raw_text", text: "Value" },
        ],
        [
          { type: "raw_text", text: "Revenue" },
          { type: "raw_text", text: "$1.2M" },
        ],
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Q2 results*" },
    },
    {
      type: "table",
      rows: [
        [
          { type: "raw_text", text: "Metric" },
          { type: "raw_text", text: "Value" },
        ],
        [
          { type: "raw_text", text: "Revenue" },
          { type: "raw_text", text: "$1.4M" },
        ],
      ],
    },
  ],
  null,
  2,
);

const twoFocusOnLoad = JSON.stringify(
  {
    type: "modal",
    title: { type: "plain_text", text: "Bug report" },
    submit: { type: "plain_text", text: "File" },
    blocks: [
      {
        type: "input",
        block_id: "title",
        label: { type: "plain_text", text: "Title" },
        element: {
          type: "plain_text_input",
          action_id: "title_input",
          focus_on_load: true,
        },
      },
      {
        type: "input",
        block_id: "description",
        label: { type: "plain_text", text: "Description" },
        element: {
          type: "plain_text_input",
          action_id: "description_input",
          multiline: true,
          focus_on_load: true,
        },
      },
    ],
  },
  null,
  2,
);

/**
 * Build a payload that exceeds the 12,000-char cumulative markdown limit.
 * We do it programmatically so the source preset stays readable.
 */
const markdownOverflow = (() => {
  const chunk = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20);
  // ~1140 chars per chunk × 12 = ~13,680 chars total — comfortably over the cap.
  const blocks = Array.from({ length: 12 }, (_, i) => ({
    type: "markdown",
    text: `### Section ${i + 1}\n\n${chunk}`,
  }));
  return JSON.stringify(blocks, null, 2);
})();

export const presets: Preset[] = [
  {
    id: "hello-world",
    label: "Hello world",
    tone: "valid",
    target: "blocks",
    json: helloWorld,
  },
  {
    id: "modal-view",
    label: "Modal view",
    tone: "valid",
    target: "modal",
    json: modalView,
  },
  {
    id: "duplicate-block-id",
    label: "Duplicate block_id",
    tone: "invalid",
    target: "blocks",
    json: duplicateBlockIds,
  },
  {
    id: "markdown-on-modal",
    label: "markdown block on modal",
    tone: "invalid",
    target: "blocks",
    surface: "modal",
    json: markdownOnModal,
  },
  {
    id: "two-tables",
    label: "Two table blocks",
    tone: "invalid",
    target: "blocks",
    json: twoTables,
  },
  {
    id: "two-focus-on-load",
    label: "focus_on_load × 2",
    tone: "invalid",
    target: "modal",
    json: twoFocusOnLoad,
  },
  {
    id: "markdown-overflow",
    label: "Cumulative markdown >12k",
    tone: "invalid",
    target: "blocks",
    json: markdownOverflow,
  },
];

export const defaultPresetId = "hello-world";
