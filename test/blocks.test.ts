import { compileDef } from "./helpers/compile-def";

const button = {
  type: "button",
  text: { type: "plain_text", text: "Go" },
  action_id: "btn_a",
};

describe("blocks", () => {
  describe("actions_block", () => {
    const validate = compileDef("actions_block");

    it("accepts minimal valid", () => {
      expect(validate({ type: "actions", elements: [button] })).toBe(true);
    });

    it("rejects empty elements", () => {
      expect(validate({ type: "actions", elements: [] })).toBe(false);
    });

    it("rejects 26 elements (max 25)", () => {
      const elements = Array.from({ length: 26 }, (_, i) => ({
        ...button,
        action_id: `b${i}`,
      }));
      expect(validate({ type: "actions", elements })).toBe(false);
    });

    it("rejects wrong type discriminator", () => {
      expect(validate({ type: "section", elements: [button] })).toBe(false);
    });

    it("rejects a non-interactive element (divider)", () => {
      expect(validate({ type: "actions", elements: [{ type: "divider" }] })).toBe(false);
    });

    it("rejects additionalProperties", () => {
      expect(validate({ type: "actions", elements: [button], extra: 1 })).toBe(false);
    });
  });

  describe("alert_block", () => {
    const validate = compileDef("alert_block");

    it("accepts minimal valid with plain_text", () => {
      expect(validate({ type: "alert", text: { type: "plain_text", text: "hi" } })).toBe(true);
    });

    it("accepts mrkdwn text + all level values", () => {
      for (const level of ["default", "info", "warning", "error", "success"]) {
        expect(
          validate({
            type: "alert",
            text: { type: "mrkdwn", text: "x" },
            level,
          }),
        ).toBe(true);
      }
    });

    it("rejects unknown level", () => {
      expect(
        validate({
          type: "alert",
          text: { type: "plain_text", text: "x" },
          level: "panic",
        }),
      ).toBe(false);
    });

    it("rejects missing text", () => {
      expect(validate({ type: "alert" })).toBe(false);
    });
  });

  describe("card_block", () => {
    const validate = compileDef("card_block");

    it("accepts card with only title", () => {
      expect(validate({ type: "card", title: { type: "plain_text", text: "Card" } })).toBe(true);
    });

    it("accepts card with all fields", () => {
      expect(
        validate({
          type: "card",
          hero_image: {
            type: "image",
            image_url: "https://e.com/h.png",
            alt_text: "h",
          },
          icon: {
            type: "image",
            image_url: "https://e.com/i.png",
            alt_text: "i",
          },
          title: { type: "plain_text", text: "T" },
          subtitle: { type: "plain_text", text: "S" },
          body: { type: "mrkdwn", text: "B" },
          actions: [button],
        }),
      ).toBe(true);
    });

    it("rejects card with no required fields", () => {
      expect(validate({ type: "card" })).toBe(false);
    });

    it("rejects title > 150 chars", () => {
      expect(
        validate({
          type: "card",
          title: { type: "plain_text", text: "x".repeat(151) },
        }),
      ).toBe(false);
    });

    it("rejects body > 200 chars", () => {
      expect(
        validate({
          type: "card",
          body: { type: "mrkdwn", text: "x".repeat(201) },
        }),
      ).toBe(false);
    });

    it("accepts up to 2 action buttons", () => {
      expect(
        validate({
          type: "card",
          actions: [
            { ...button, action_id: "btn_a" },
            { ...button, action_id: "btn_b" },
          ],
        }),
      ).toBe(true);
    });

    it("rejects more than 2 action buttons", () => {
      expect(
        validate({
          type: "card",
          actions: [
            { ...button, action_id: "btn_a" },
            { ...button, action_id: "btn_b" },
            { ...button, action_id: "btn_c" },
          ],
        }),
      ).toBe(false);
    });
  });

  describe("carousel_block", () => {
    const validate = compileDef("carousel_block");
    const card = { type: "card", title: { type: "plain_text", text: "T" } };

    it("accepts 1 card", () => {
      expect(validate({ type: "carousel", elements: [card] })).toBe(true);
    });

    it("accepts 10 cards", () => {
      expect(validate({ type: "carousel", elements: Array(10).fill(card) })).toBe(true);
    });

    it("rejects empty", () => {
      expect(validate({ type: "carousel", elements: [] })).toBe(false);
    });

    it("rejects 11 cards", () => {
      expect(validate({ type: "carousel", elements: Array(11).fill(card) })).toBe(false);
    });

    it("rejects non-card elements", () => {
      expect(validate({ type: "carousel", elements: [{ type: "divider" }] })).toBe(false);
    });
  });

  describe("context_block", () => {
    const validate = compileDef("context_block");

    it("accepts image + text elements", () => {
      expect(
        validate({
          type: "context",
          elements: [
            { type: "image", image_url: "https://e.com/x.png", alt_text: "x" },
            { type: "mrkdwn", text: "hi" },
          ],
        }),
      ).toBe(true);
    });

    it("rejects 11 elements (max 10)", () => {
      expect(
        validate({
          type: "context",
          elements: Array(11).fill({ type: "plain_text", text: "x" }),
        }),
      ).toBe(false);
    });

    it("rejects empty elements", () => {
      expect(validate({ type: "context", elements: [] })).toBe(false);
    });

    it("rejects a non-image/text element (button)", () => {
      expect(validate({ type: "context", elements: [button] })).toBe(false);
    });
  });

  describe("context_actions_block", () => {
    const validate = compileDef("context_actions_block");
    const iconBtn = {
      type: "icon_button",
      icon: "trash",
      text: { type: "plain_text", text: "del" },
    };
    const feedbackBtn = {
      type: "feedback_buttons",
      positive_button: {
        text: { type: "plain_text", text: "👍" },
        value: "up",
      },
      negative_button: {
        text: { type: "plain_text", text: "👎" },
        value: "down",
      },
    };

    it("accepts icon_button + feedback_buttons", () => {
      expect(validate({ type: "context_actions", elements: [iconBtn, feedbackBtn] })).toBe(true);
    });

    it("rejects 6 elements (max 5)", () => {
      expect(validate({ type: "context_actions", elements: Array(6).fill(iconBtn) })).toBe(false);
    });

    it("rejects a regular button inside", () => {
      expect(validate({ type: "context_actions", elements: [button] })).toBe(false);
    });
  });

  describe("divider_block", () => {
    const validate = compileDef("divider_block");

    it("accepts bare divider", () => {
      expect(validate({ type: "divider" })).toBe(true);
    });

    it("accepts divider with block_id", () => {
      expect(validate({ type: "divider", block_id: "d1" })).toBe(true);
    });

    it("rejects additionalProperties", () => {
      expect(validate({ type: "divider", text: "nope" })).toBe(false);
    });

    it("rejects block_id > 255 chars", () => {
      expect(validate({ type: "divider", block_id: "x".repeat(256) })).toBe(false);
    });
  });

  describe("file_block", () => {
    const validate = compileDef("file_block");

    it("accepts file block with source: remote", () => {
      expect(validate({ type: "file", external_id: "F1", source: "remote" })).toBe(true);
    });

    it('rejects any source other than "remote"', () => {
      expect(validate({ type: "file", external_id: "F1", source: "local" })).toBe(false);
    });

    it("rejects missing external_id", () => {
      expect(validate({ type: "file", source: "remote" })).toBe(false);
    });
  });

  describe("header_block", () => {
    const validate = compileDef("header_block");

    it("accepts plain_text header", () => {
      expect(validate({ type: "header", text: { type: "plain_text", text: "H" } })).toBe(true);
    });

    it("rejects mrkdwn header", () => {
      expect(validate({ type: "header", text: { type: "mrkdwn", text: "H" } })).toBe(false);
    });

    it("rejects text > 150 chars", () => {
      expect(
        validate({
          type: "header",
          text: { type: "plain_text", text: "x".repeat(151) },
        }),
      ).toBe(false);
    });
  });

  describe("image_block", () => {
    const validate = compileDef("image_block");

    it("accepts image_url variant", () => {
      expect(
        validate({
          type: "image",
          image_url: "https://e.com/x.png",
          alt_text: "x",
        }),
      ).toBe(true);
    });

    it("accepts slack_file variant (url)", () => {
      expect(
        validate({
          type: "image",
          slack_file: { url: "https://e.com/f.png" },
          alt_text: "x",
        }),
      ).toBe(true);
    });

    it("accepts slack_file variant (id)", () => {
      expect(validate({ type: "image", slack_file: { id: "F1" }, alt_text: "x" })).toBe(true);
    });

    it("rejects both image_url and slack_file", () => {
      expect(
        validate({
          type: "image",
          image_url: "https://e.com/x.png",
          slack_file: { id: "F1" },
          alt_text: "x",
        }),
      ).toBe(false);
    });

    it("rejects neither image_url nor slack_file", () => {
      expect(validate({ type: "image", alt_text: "x" })).toBe(false);
    });

    it("rejects alt_text > 2000 chars", () => {
      expect(
        validate({
          type: "image",
          image_url: "https://e.com/x.png",
          alt_text: "x".repeat(2001),
        }),
      ).toBe(false);
    });

    it("rejects image_url > 3000 chars", () => {
      expect(
        validate({
          type: "image",
          image_url: `https://e.com/${"x".repeat(3000)}`,
          alt_text: "x",
        }),
      ).toBe(false);
    });
  });

  describe("input_block", () => {
    const validate = compileDef("input_block");
    const base = {
      type: "input",
      label: { type: "plain_text", text: "L" },
      element: { type: "plain_text_input", action_id: "a" },
    };

    it("accepts minimal input block", () => {
      expect(validate(base)).toBe(true);
    });

    it("accepts with all optional fields", () => {
      expect(
        validate({
          ...base,
          hint: { type: "plain_text", text: "h" },
          optional: true,
          dispatch_action: true,
          block_id: "b1",
        }),
      ).toBe(true);
    });

    it("rejects dispatch_action: true with file_input element", () => {
      expect(
        validate({
          type: "input",
          label: { type: "plain_text", text: "L" },
          element: { type: "file_input", action_id: "f" },
          dispatch_action: true,
        }),
      ).toBe(false);
    });

    it("accepts dispatch_action: false with file_input element", () => {
      expect(
        validate({
          type: "input",
          label: { type: "plain_text", text: "L" },
          element: { type: "file_input", action_id: "f" },
          dispatch_action: false,
        }),
      ).toBe(true);
    });

    it("rejects missing element", () => {
      expect(validate({ type: "input", label: { type: "plain_text", text: "L" } })).toBe(false);
    });

    it("rejects mrkdwn label", () => {
      expect(validate({ ...base, label: { type: "mrkdwn", text: "L" } })).toBe(false);
    });
  });

  describe("markdown_block", () => {
    const validate = compileDef("markdown_block");

    it("accepts minimal markdown", () => {
      expect(validate({ type: "markdown", text: "hi" })).toBe(true);
    });

    it("rejects empty text", () => {
      expect(validate({ type: "markdown", text: "" })).toBe(false);
    });

    it("rejects text > 12000 chars", () => {
      expect(validate({ type: "markdown", text: "x".repeat(12001) })).toBe(false);
    });

    it("accepts text at 12000 char boundary", () => {
      expect(validate({ type: "markdown", text: "x".repeat(12000) })).toBe(true);
    });
  });

  describe("plan_block", () => {
    const validate = compileDef("plan_block");

    it("accepts plan with string title", () => {
      expect(validate({ type: "plan", title: "Planning" })).toBe(true);
    });

    it("accepts plan with plain_text title", () => {
      expect(
        validate({
          type: "plan",
          title: { type: "plain_text", text: "Planning" },
        }),
      ).toBe(true);
    });

    it("accepts plan with tasks", () => {
      expect(
        validate({
          type: "plan",
          title: "Planning",
          tasks: [{ task_id: "t1", title: "Do thing", status: "pending" }],
        }),
      ).toBe(true);
    });

    it("rejects plan with invalid task status", () => {
      expect(
        validate({
          type: "plan",
          title: "P",
          tasks: [{ task_id: "t1", title: "T", status: "maybe" }],
        }),
      ).toBe(false);
    });
  });

  describe("rich_text_block", () => {
    const validate = compileDef("rich_text_block");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "hi" }],
            },
          ],
        }),
      ).toBe(true);
    });

    it("accepts empty elements (Slack allows this)", () => {
      expect(validate({ type: "rich_text", elements: [] })).toBe(true);
    });

    it("rejects a non-rich-text container in elements", () => {
      expect(validate({ type: "rich_text", elements: [{ type: "section" }] })).toBe(false);
    });
  });

  describe("section_block", () => {
    const validate = compileDef("section_block");

    it("accepts section with text only", () => {
      expect(validate({ type: "section", text: { type: "mrkdwn", text: "hi" } })).toBe(true);
    });

    it("accepts section with fields only", () => {
      expect(
        validate({
          type: "section",
          fields: [{ type: "mrkdwn", text: "f1" }],
        }),
      ).toBe(true);
    });

    it("accepts section with text AND fields", () => {
      expect(
        validate({
          type: "section",
          text: { type: "mrkdwn", text: "hi" },
          fields: [{ type: "mrkdwn", text: "f1" }],
        }),
      ).toBe(true);
    });

    it("rejects section with neither text nor fields", () => {
      expect(validate({ type: "section" })).toBe(false);
    });

    it("rejects 11 fields (max 10)", () => {
      expect(
        validate({
          type: "section",
          fields: Array(11).fill({ type: "mrkdwn", text: "f" }),
        }),
      ).toBe(false);
    });

    it("rejects field text > 2000 chars", () => {
      expect(
        validate({
          type: "section",
          fields: [{ type: "mrkdwn", text: "x".repeat(2001) }],
        }),
      ).toBe(false);
    });

    it("rejects text > 3000 chars", () => {
      expect(
        validate({
          type: "section",
          text: { type: "mrkdwn", text: "x".repeat(3001) },
        }),
      ).toBe(false);
    });

    it("accepts section with button accessory", () => {
      expect(
        validate({
          type: "section",
          text: { type: "mrkdwn", text: "hi" },
          accessory: button,
        }),
      ).toBe(true);
    });

    it("rejects a plain_text_input as section accessory", () => {
      expect(
        validate({
          type: "section",
          text: { type: "mrkdwn", text: "hi" },
          accessory: { type: "plain_text_input", action_id: "a" },
        }),
      ).toBe(false);
    });

    it("rejects a datetimepicker as section accessory (actions/input only per docs)", () => {
      expect(
        validate({
          type: "section",
          text: { type: "mrkdwn", text: "hi" },
          accessory: { type: "datetimepicker", action_id: "dt" },
        }),
      ).toBe(false);
    });
  });

  describe("table_block", () => {
    const validate = compileDef("table_block");
    const cell = { type: "raw_text", text: "a" };

    it("accepts minimal table", () => {
      expect(validate({ type: "table", rows: [[cell]] })).toBe(true);
    });

    it("accepts rich_text cells", () => {
      expect(
        validate({
          type: "table",
          rows: [
            [
              {
                type: "rich_text",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [{ type: "text", text: "a" }],
                  },
                ],
              },
            ],
          ],
        }),
      ).toBe(true);
    });

    it("rejects >100 rows", () => {
      expect(validate({ type: "table", rows: Array(101).fill([cell]) })).toBe(false);
    });

    it("rejects >20 cells per row", () => {
      expect(validate({ type: "table", rows: [Array(21).fill(cell)] })).toBe(false);
    });

    it("accepts column_settings with null to skip", () => {
      expect(
        validate({
          type: "table",
          rows: [[cell, cell]],
          column_settings: [{ align: "left" }, null],
        }),
      ).toBe(true);
    });

    it("rejects bad align value", () => {
      expect(
        validate({
          type: "table",
          rows: [[cell]],
          column_settings: [{ align: "middle" }],
        }),
      ).toBe(false);
    });
  });

  describe("task_card_block", () => {
    const validate = compileDef("task_card_block");

    it("accepts minimal task_card", () => {
      expect(validate({ type: "task_card", task_id: "t1", title: "Do" })).toBe(true);
    });

    it("accepts all fields", () => {
      expect(
        validate({
          type: "task_card",
          task_id: "t1",
          title: "Do",
          details: {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "d" }],
              },
            ],
          },
          output: {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "o" }],
              },
            ],
          },
          sources: [{ type: "url", url: "https://e.com", text: "link" }],
          status: "complete",
        }),
      ).toBe(true);
    });

    it("rejects invalid status", () => {
      expect(
        validate({
          type: "task_card",
          task_id: "t",
          title: "T",
          status: "done",
        }),
      ).toBe(false);
    });

    it("rejects missing task_id", () => {
      expect(validate({ type: "task_card", title: "T" })).toBe(false);
    });
  });

  describe("video_block", () => {
    const validate = compileDef("video_block");
    const valid = {
      type: "video",
      alt_text: "v",
      title: { type: "plain_text", text: "T" },
      thumbnail_url: "https://e.com/t.png",
      video_url: "https://e.com/v",
    };

    it("accepts minimal video", () => {
      expect(validate(valid)).toBe(true);
    });

    it("rejects non-HTTPS video_url", () => {
      expect(validate({ ...valid, video_url: "http://e.com/v" })).toBe(false);
    });

    it("rejects non-HTTPS title_url", () => {
      expect(validate({ ...valid, title_url: "http://e.com" })).toBe(false);
    });

    it("rejects author_name > 49 chars", () => {
      expect(validate({ ...valid, author_name: "x".repeat(50) })).toBe(false);
    });

    it("rejects missing required fields", () => {
      for (const f of ["alt_text", "title", "thumbnail_url", "video_url"]) {
        const copy: Record<string, unknown> = { ...valid };
        delete copy[f];
        expect(validate(copy)).toBe(false);
      }
    });
  });

  describe("unknown block type", () => {
    const validate = compileDef("block");
    it("rejects a type not in the union", () => {
      expect(validate({ type: "frobnicator" })).toBe(false);
    });
  });
});
