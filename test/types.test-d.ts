// Type-level regression test for the generated types.
// vitest's regular `test`/`expect` runner does not exercise type errors, so we
// rely on the project-wide `tsc --noEmit` (run via `pnpm typecheck`) to catch
// regressions here. The file is included in tsconfig's `test/**` glob and
// authored to exercise the most easily-broken shapes: anything in the schema
// using `allOf` constraint refinements (text containers, confirm, options) or
// `oneOf` disjuncts (block, text_object, slack_file).

import type {
  ActionsBlock,
  Block,
  ButtonElement,
  CheckboxesElement,
  ConfirmObject,
  HeaderBlock,
  HomeView,
  ImageBlock,
  InputBlock,
  ModalView,
  OptionObjectPlainText,
  RichTextBlock,
  SectionBlock,
} from "../src/types";

// Plain-text containers used to break because allOf flattening generated
// `& { text?: { [k: string]: unknown } }` intersections.
export const header: HeaderBlock = {
  type: "header",
  text: { type: "plain_text", text: "Welcome" },
};

export const section: SectionBlock = {
  type: "section",
  text: { type: "mrkdwn", text: "hi" },
};

export const button: ButtonElement = {
  type: "button",
  text: { type: "plain_text", text: "Go" },
  action_id: "go",
  style: "primary",
  value: "v",
};

export const confirm: ConfirmObject = {
  title: { type: "plain_text", text: "Are you sure?" },
  text: { type: "mrkdwn", text: "This *can't* be undone." },
  confirm: { type: "plain_text", text: "Yes" },
  deny: { type: "plain_text", text: "No" },
  style: "danger",
};

// Option objects also went through allOf refinement.
export const option: OptionObjectPlainText = {
  text: { type: "plain_text", text: "label" },
  value: "v",
};

// Composed/discriminated shapes.
export const checkboxes: CheckboxesElement = {
  type: "checkboxes",
  action_id: "boxes",
  options: [option, { text: { type: "plain_text", text: "b" }, value: "b" }],
};

export const actions: ActionsBlock = {
  type: "actions",
  elements: [button, checkboxes],
};

export const input: InputBlock = {
  type: "input",
  label: { type: "plain_text", text: "Name" },
  element: { type: "plain_text_input", action_id: "name" },
};

// slack_file is a oneOf of {url} / {id}.
export const image: ImageBlock = {
  type: "image",
  alt_text: "alt",
  image_url: "https://example.com/x.png",
};

// rich_text container with leaves — heavy allOf usage at the leaf level.
export const rich: RichTextBlock = {
  type: "rich_text",
  elements: [
    {
      type: "rich_text_section",
      elements: [
        { type: "text", text: "hello " },
        { type: "user", user_id: "U123ABC" },
        { type: "text", text: " ", style: { bold: true } },
      ],
    },
  ],
};

// View envelopes.
export const modal: ModalView = {
  type: "modal",
  title: { type: "plain_text", text: "Pick" },
  submit: { type: "plain_text", text: "Save" },
  blocks: [section, actions, input],
};

export const home: HomeView = {
  type: "home",
  blocks: [section, { type: "divider" }],
};

// Discriminated-union Block — exhaustiveness check.
export const blocks: Block[] = [section, header, actions, input, image, rich, { type: "divider" }];
