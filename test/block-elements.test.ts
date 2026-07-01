import { compileDef } from "./helpers/compile-def";

const plainOption = (v: string) => ({
  text: { type: "plain_text", text: v },
  value: v,
});

const mrkdwnOption = (v: string) => ({
  text: { type: "mrkdwn", text: v },
  value: v,
});

describe("block elements", () => {
  describe("button_element", () => {
    const validate = compileDef("button_element");
    const valid = {
      type: "button",
      text: { type: "plain_text", text: "Go" },
    };

    it("accepts minimal button", () => {
      expect(validate(valid)).toBe(true);
    });

    it("accepts all optional fields", () => {
      expect(
        validate({
          ...valid,
          action_id: "a1",
          url: "https://e.com",
          value: "v",
          style: "primary",
          accessibility_label: "Go button",
          confirm: {
            title: { type: "plain_text", text: "Sure?" },
            text: { type: "plain_text", text: "Confirm" },
            confirm: { type: "plain_text", text: "Yes" },
            deny: { type: "plain_text", text: "No" },
          },
        }),
      ).toBe(true);
    });

    it("rejects mrkdwn text", () => {
      expect(validate({ type: "button", text: { type: "mrkdwn", text: "G" } })).toBe(false);
    });

    it("rejects button text > 75 chars", () => {
      expect(
        validate({
          type: "button",
          text: { type: "plain_text", text: "x".repeat(76) },
        }),
      ).toBe(false);
    });

    it("rejects value > 2000 chars", () => {
      expect(validate({ ...valid, value: "x".repeat(2001) })).toBe(false);
    });

    it("rejects invalid style", () => {
      expect(validate({ ...valid, style: "fancy" })).toBe(false);
    });

    it("rejects url > 3000 chars", () => {
      expect(validate({ ...valid, url: `https://e.com/${"x".repeat(3000)}` })).toBe(false);
    });
  });

  describe("icon_button_element", () => {
    const validate = compileDef("icon_button_element");

    it("accepts trash icon", () => {
      expect(
        validate({
          type: "icon_button",
          icon: "trash",
          text: { type: "plain_text", text: "Delete" },
        }),
      ).toBe(true);
    });

    it("rejects unknown icon", () => {
      expect(
        validate({
          type: "icon_button",
          icon: "pencil",
          text: { type: "plain_text", text: "Edit" },
        }),
      ).toBe(false);
    });

    it("accepts visible_to_user_ids", () => {
      expect(
        validate({
          type: "icon_button",
          icon: "trash",
          text: { type: "plain_text", text: "D" },
          visible_to_user_ids: ["U12345", "W98765"],
        }),
      ).toBe(true);
    });

    it("rejects bad user_id format in visible_to_user_ids", () => {
      expect(
        validate({
          type: "icon_button",
          icon: "trash",
          text: { type: "plain_text", text: "D" },
          visible_to_user_ids: ["invalid-id"],
        }),
      ).toBe(false);
    });
  });

  describe("checkboxes_element", () => {
    const validate = compileDef("checkboxes_element");

    it("accepts plain_text option", () => {
      expect(validate({ type: "checkboxes", options: [plainOption("a")] })).toBe(true);
    });

    it("accepts mrkdwn option", () => {
      expect(validate({ type: "checkboxes", options: [mrkdwnOption("a")] })).toBe(true);
    });

    it("rejects empty options", () => {
      expect(validate({ type: "checkboxes", options: [] })).toBe(false);
    });

    it("rejects >10 options", () => {
      expect(
        validate({
          type: "checkboxes",
          options: Array.from({ length: 11 }, (_, i) => plainOption(`o${i}`)),
        }),
      ).toBe(false);
    });
  });

  describe("radio_buttons_element", () => {
    const validate = compileDef("radio_buttons_element");

    it("accepts minimal", () => {
      expect(validate({ type: "radio_buttons", options: [plainOption("a")] })).toBe(true);
    });

    it("rejects >10 options", () => {
      expect(
        validate({
          type: "radio_buttons",
          options: Array.from({ length: 11 }, (_, i) => plainOption(`o${i}`)),
        }),
      ).toBe(false);
    });
  });

  describe("datepicker_element", () => {
    const validate = compileDef("datepicker_element");

    it("accepts minimal", () => {
      expect(validate({ type: "datepicker" })).toBe(true);
    });

    it("accepts YYYY-MM-DD initial_date", () => {
      expect(validate({ type: "datepicker", initial_date: "2026-04-16" })).toBe(true);
    });

    it("rejects bad initial_date format", () => {
      expect(validate({ type: "datepicker", initial_date: "16-04-2026" })).toBe(false);
    });

    it("rejects impossible month", () => {
      expect(validate({ type: "datepicker", initial_date: "2026-13-01" })).toBe(false);
    });
  });

  describe("timepicker_element", () => {
    const validate = compileDef("timepicker_element");

    it("accepts HH:mm initial_time", () => {
      expect(validate({ type: "timepicker", initial_time: "09:30" })).toBe(true);
    });

    it("accepts edge 23:59", () => {
      expect(validate({ type: "timepicker", initial_time: "23:59" })).toBe(true);
    });

    it("rejects 24:00", () => {
      expect(validate({ type: "timepicker", initial_time: "24:00" })).toBe(false);
    });

    it("rejects missing leading zero", () => {
      expect(validate({ type: "timepicker", initial_time: "9:30" })).toBe(false);
    });

    it("accepts timezone", () => {
      expect(validate({ type: "timepicker", timezone: "America/Chicago" })).toBe(true);
    });
  });

  describe("datetimepicker_element", () => {
    const validate = compileDef("datetimepicker_element");

    it("accepts Unix timestamp in seconds", () => {
      expect(validate({ type: "datetimepicker", initial_date_time: 1628633820 })).toBe(true);
    });

    it("rejects negative timestamp", () => {
      expect(validate({ type: "datetimepicker", initial_date_time: -1 })).toBe(false);
    });

    it("rejects non-integer", () => {
      expect(validate({ type: "datetimepicker", initial_date_time: 1.5 })).toBe(false);
    });
  });

  describe("email_input_element", () => {
    const validate = compileDef("email_input_element");

    it("accepts minimal", () => {
      expect(validate({ type: "email_text_input" })).toBe(true);
    });

    it("accepts initial_value", () => {
      expect(validate({ type: "email_text_input", initial_value: "a@b.com" })).toBe(true);
    });
  });

  describe("url_input_element", () => {
    const validate = compileDef("url_input_element");

    it("accepts minimal", () => {
      expect(validate({ type: "url_text_input" })).toBe(true);
    });
  });

  describe("number_input_element", () => {
    const validate = compileDef("number_input_element");

    it("accepts integer with is_decimal_allowed: false", () => {
      expect(
        validate({
          type: "number_input",
          is_decimal_allowed: false,
          min_value: "0",
          max_value: "100",
        }),
      ).toBe(true);
    });

    it("accepts decimal with is_decimal_allowed: true", () => {
      expect(
        validate({
          type: "number_input",
          is_decimal_allowed: true,
          initial_value: "0.5",
        }),
      ).toBe(true);
    });

    it("rejects missing is_decimal_allowed", () => {
      expect(validate({ type: "number_input" })).toBe(false);
    });

    it("rejects non-numeric initial_value", () => {
      expect(
        validate({
          type: "number_input",
          is_decimal_allowed: true,
          initial_value: "abc",
        }),
      ).toBe(false);
    });
  });

  describe("plain_text_input_element", () => {
    const validate = compileDef("plain_text_input_element");

    it("accepts minimal", () => {
      expect(validate({ type: "plain_text_input" })).toBe(true);
    });

    it("accepts multiline + min/max_length", () => {
      expect(
        validate({
          type: "plain_text_input",
          multiline: true,
          min_length: 1,
          max_length: 1000,
        }),
      ).toBe(true);
    });

    it("rejects max_length > 3000", () => {
      expect(validate({ type: "plain_text_input", max_length: 3001 })).toBe(false);
    });

    it("rejects max_length < 1", () => {
      expect(validate({ type: "plain_text_input", max_length: 0 })).toBe(false);
    });

    it("rejects min_length < 0", () => {
      expect(validate({ type: "plain_text_input", min_length: -1 })).toBe(false);
    });
  });

  describe("overflow_element", () => {
    const validate = compileDef("overflow_element");

    it("accepts 1 option", () => {
      expect(validate({ type: "overflow", options: [plainOption("a")] })).toBe(true);
    });

    it("accepts 5 options", () => {
      expect(
        validate({
          type: "overflow",
          options: Array.from({ length: 5 }, (_, i) => plainOption(`o${i}`)),
        }),
      ).toBe(true);
    });

    it("rejects 6 options", () => {
      expect(
        validate({
          type: "overflow",
          options: Array.from({ length: 6 }, (_, i) => plainOption(`o${i}`)),
        }),
      ).toBe(false);
    });

    it("accepts option with url (overflow-only feature)", () => {
      expect(
        validate({
          type: "overflow",
          options: [{ ...plainOption("a"), url: "https://e.com" }],
        }),
      ).toBe(true);
    });
  });

  describe("static_select_element", () => {
    const validate = compileDef("static_select_element");

    it("accepts options", () => {
      expect(
        validate({
          type: "static_select",
          placeholder: { type: "plain_text", text: "pick" },
          options: [plainOption("a")],
        }),
      ).toBe(true);
    });

    it("accepts option_groups", () => {
      expect(
        validate({
          type: "static_select",
          placeholder: { type: "plain_text", text: "pick" },
          option_groups: [
            {
              label: { type: "plain_text", text: "G" },
              options: [plainOption("a")],
            },
          ],
        }),
      ).toBe(true);
    });

    it("rejects options AND option_groups together", () => {
      expect(
        validate({
          type: "static_select",
          options: [plainOption("a")],
          option_groups: [
            {
              label: { type: "plain_text", text: "G" },
              options: [plainOption("b")],
            },
          ],
        }),
      ).toBe(false);
    });

    it("rejects neither options nor option_groups", () => {
      expect(validate({ type: "static_select" })).toBe(false);
    });

    it("rejects >100 options", () => {
      expect(
        validate({
          type: "static_select",
          options: Array.from({ length: 101 }, (_, i) => plainOption(`o${i}`)),
        }),
      ).toBe(false);
    });
  });

  describe("external_select_element", () => {
    const validate = compileDef("external_select_element");

    it("accepts minimal", () => {
      expect(validate({ type: "external_select" })).toBe(true);
    });

    it("accepts min_query_length", () => {
      expect(validate({ type: "external_select", min_query_length: 3 })).toBe(true);
    });
  });

  describe("users_select_element", () => {
    const validate = compileDef("users_select_element");

    it("accepts valid user_id", () => {
      expect(validate({ type: "users_select", initial_user: "U123ABC" })).toBe(true);
    });

    it("rejects bad user_id format", () => {
      expect(validate({ type: "users_select", initial_user: "user-123" })).toBe(false);
    });
  });

  describe("conversations_select_element", () => {
    const validate = compileDef("conversations_select_element");

    it("accepts with filter", () => {
      expect(
        validate({
          type: "conversations_select",
          filter: { include: ["public", "private"], exclude_bot_users: true },
        }),
      ).toBe(true);
    });

    it("rejects empty filter object", () => {
      expect(validate({ type: "conversations_select", filter: {} })).toBe(false);
    });

    it("rejects unknown include value", () => {
      expect(
        validate({
          type: "conversations_select",
          filter: { include: ["public", "secret"] },
        }),
      ).toBe(false);
    });

    it("accepts response_url_enabled + default_to_current_conversation", () => {
      expect(
        validate({
          type: "conversations_select",
          response_url_enabled: true,
          default_to_current_conversation: true,
        }),
      ).toBe(true);
    });
  });

  describe("channels_select_element", () => {
    const validate = compileDef("channels_select_element");

    it("accepts valid channel_id", () => {
      expect(validate({ type: "channels_select", initial_channel: "C123ABC" })).toBe(true);
    });

    it("rejects U-prefixed id (user, not channel)", () => {
      expect(validate({ type: "channels_select", initial_channel: "U123ABC" })).toBe(false);
    });
  });

  describe("multi_static_select_element", () => {
    const validate = compileDef("multi_static_select_element");

    it("accepts max_selected_items >= 1", () => {
      expect(
        validate({
          type: "multi_static_select",
          options: [plainOption("a")],
          max_selected_items: 1,
        }),
      ).toBe(true);
    });

    it("rejects max_selected_items: 0", () => {
      expect(
        validate({
          type: "multi_static_select",
          options: [plainOption("a")],
          max_selected_items: 0,
        }),
      ).toBe(false);
    });
  });

  describe("multi_users_select_element", () => {
    const validate = compileDef("multi_users_select_element");

    it("accepts initial_users array", () => {
      expect(
        validate({
          type: "multi_users_select",
          initial_users: ["U1", "U2", "W3"],
        }),
      ).toBe(true);
    });
  });

  describe("multi_channels_select_element", () => {
    const validate = compileDef("multi_channels_select_element");

    it("accepts initial_channels", () => {
      expect(
        validate({
          type: "multi_channels_select",
          initial_channels: ["C1A", "G2B"],
        }),
      ).toBe(true);
    });
  });

  describe("multi_conversations_select_element", () => {
    const validate = compileDef("multi_conversations_select_element");

    it("accepts default_to_current_conversation", () => {
      expect(
        validate({
          type: "multi_conversations_select",
          default_to_current_conversation: true,
        }),
      ).toBe(true);
    });
  });

  describe("multi_external_select_element", () => {
    const validate = compileDef("multi_external_select_element");

    it("accepts min_query_length", () => {
      expect(validate({ type: "multi_external_select", min_query_length: 2 })).toBe(true);
    });
  });

  describe("feedback_buttons_element", () => {
    const validate = compileDef("feedback_buttons_element");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "feedback_buttons",
          positive_button: {
            text: { type: "plain_text", text: "Y" },
            value: "y",
          },
          negative_button: {
            text: { type: "plain_text", text: "N" },
            value: "n",
          },
        }),
      ).toBe(true);
    });

    it("rejects missing negative_button", () => {
      expect(
        validate({
          type: "feedback_buttons",
          positive_button: {
            text: { type: "plain_text", text: "Y" },
            value: "y",
          },
        }),
      ).toBe(false);
    });
  });

  describe("workflow_button_element", () => {
    const validate = compileDef("workflow_button_element");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "workflow_button",
          text: { type: "plain_text", text: "Run" },
          action_id: "wf1",
          workflow: { trigger: { url: "https://slack.com/shortcuts/abc/xyz" } },
        }),
      ).toBe(true);
    });

    it("rejects missing workflow", () => {
      expect(
        validate({
          type: "workflow_button",
          text: { type: "plain_text", text: "Run" },
          action_id: "wf1",
        }),
      ).toBe(false);
    });
  });

  describe("rich_text_input_element", () => {
    const validate = compileDef("rich_text_input_element");

    it("accepts minimal", () => {
      expect(validate({ type: "rich_text_input", action_id: "rt1" })).toBe(true);
    });

    it("accepts initial_value as rich_text block", () => {
      expect(
        validate({
          type: "rich_text_input",
          action_id: "rt1",
          initial_value: {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [{ type: "text", text: "seed" }],
              },
            ],
          },
        }),
      ).toBe(true);
    });

    it("rejects missing action_id (required)", () => {
      expect(validate({ type: "rich_text_input" })).toBe(false);
    });
  });

  describe("file_input_element", () => {
    const validate = compileDef("file_input_element");

    it("accepts minimal", () => {
      expect(validate({ type: "file_input" })).toBe(true);
    });

    it("accepts max_files 1-10", () => {
      for (const n of [1, 5, 10]) {
        expect(validate({ type: "file_input", max_files: n })).toBe(true);
      }
    });

    it("rejects max_files: 11", () => {
      expect(validate({ type: "file_input", max_files: 11 })).toBe(false);
    });

    it("rejects max_files: 0", () => {
      expect(validate({ type: "file_input", max_files: 0 })).toBe(false);
    });

    it("accepts filetypes array", () => {
      expect(validate({ type: "file_input", filetypes: ["jpg", "png"] })).toBe(true);
    });
  });

  describe("image_element", () => {
    const validate = compileDef("image_element");

    it("accepts image_url variant", () => {
      expect(
        validate({
          type: "image",
          image_url: "https://e.com/x.png",
          alt_text: "x",
        }),
      ).toBe(true);
    });

    it("accepts slack_file variant", () => {
      expect(validate({ type: "image", slack_file: { id: "F1" }, alt_text: "x" })).toBe(true);
    });

    it("rejects both url and slack_file", () => {
      expect(
        validate({
          type: "image",
          image_url: "https://e.com/x.png",
          slack_file: { id: "F1" },
          alt_text: "x",
        }),
      ).toBe(false);
    });
  });

  describe("url_source_element", () => {
    const validate = compileDef("url_source_element");

    it("accepts url source", () => {
      expect(validate({ type: "url", url: "https://e.com", text: "link" })).toBe(true);
    });

    it("rejects missing text", () => {
      expect(validate({ type: "url", url: "https://e.com" })).toBe(false);
    });
  });
});
