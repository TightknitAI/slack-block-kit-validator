import { compileDef } from "./helpers/compile-def";

describe("composition objects", () => {
  describe("plain_text_object", () => {
    const validate = compileDef("plain_text_object");

    it("accepts minimal", () => {
      expect(validate({ type: "plain_text", text: "hi" })).toBe(true);
    });

    it("accepts with emoji flag", () => {
      expect(validate({ type: "plain_text", text: ":smile:", emoji: true })).toBe(true);
    });

    it("rejects empty text", () => {
      expect(validate({ type: "plain_text", text: "" })).toBe(false);
    });

    it("rejects text > 3000 chars", () => {
      expect(validate({ type: "plain_text", text: "x".repeat(3001) })).toBe(false);
    });

    it("rejects verbatim (mrkdwn-only field)", () => {
      expect(validate({ type: "plain_text", text: "x", verbatim: false })).toBe(false);
    });

    it("rejects mrkdwn type", () => {
      expect(validate({ type: "mrkdwn", text: "x" })).toBe(false);
    });
  });

  describe("mrkdwn_text_object", () => {
    const validate = compileDef("mrkdwn_text_object");

    it("accepts minimal", () => {
      expect(validate({ type: "mrkdwn", text: "*hi*" })).toBe(true);
    });

    it("accepts verbatim flag", () => {
      expect(validate({ type: "mrkdwn", text: "*hi*", verbatim: true })).toBe(true);
    });

    it("rejects emoji (plain_text-only field)", () => {
      expect(validate({ type: "mrkdwn", text: "x", emoji: true })).toBe(false);
    });
  });

  describe("text_object (union)", () => {
    const validate = compileDef("text_object");

    it("accepts plain_text", () => {
      expect(validate({ type: "plain_text", text: "x" })).toBe(true);
    });

    it("accepts mrkdwn", () => {
      expect(validate({ type: "mrkdwn", text: "x" })).toBe(true);
    });

    it("rejects unknown type", () => {
      expect(validate({ type: "html", text: "<p>hi</p>" })).toBe(false);
    });
  });

  describe("confirm_object", () => {
    const validate = compileDef("confirm_object");
    const valid = {
      title: { type: "plain_text", text: "Sure?" },
      text: { type: "plain_text", text: "Confirm this action" },
      confirm: { type: "plain_text", text: "Yes" },
      deny: { type: "plain_text", text: "No" },
    };

    it("accepts minimal", () => {
      expect(validate(valid)).toBe(true);
    });

    it("accepts style primary/danger", () => {
      for (const style of ["primary", "danger"]) {
        expect(validate({ ...valid, style })).toBe(true);
      }
    });

    it("rejects title > 100 chars", () => {
      expect(
        validate({
          ...valid,
          title: { type: "plain_text", text: "x".repeat(101) },
        }),
      ).toBe(false);
    });

    it("rejects text > 300 chars", () => {
      expect(
        validate({
          ...valid,
          text: { type: "plain_text", text: "x".repeat(301) },
        }),
      ).toBe(false);
    });

    it("rejects confirm > 30 chars", () => {
      expect(
        validate({
          ...valid,
          confirm: { type: "plain_text", text: "x".repeat(31) },
        }),
      ).toBe(false);
    });

    it("rejects missing deny", () => {
      const { deny, ...rest } = valid;
      expect(validate(rest)).toBe(false);
    });

    it("rejects mrkdwn title", () => {
      expect(validate({ ...valid, title: { type: "mrkdwn", text: "Sure?" } })).toBe(false);
    });

    it("accepts mrkdwn text (docs example uses mrkdwn for this field)", () => {
      expect(
        validate({
          ...valid,
          text: { type: "mrkdwn", text: "Are you *sure*?" },
        }),
      ).toBe(true);
    });

    it("rejects mrkdwn confirm (must be plain_text)", () => {
      expect(validate({ ...valid, confirm: { type: "mrkdwn", text: "Yes" } })).toBe(false);
    });

    it("rejects mrkdwn deny (must be plain_text)", () => {
      expect(validate({ ...valid, deny: { type: "mrkdwn", text: "No" } })).toBe(false);
    });

    it("rejects invalid style", () => {
      expect(validate({ ...valid, style: "neutral" })).toBe(false);
    });
  });

  describe("option_object_plain_text (select/multi/overflow context)", () => {
    const validate = compileDef("option_object_plain_text");

    it("accepts minimal", () => {
      expect(validate({ text: { type: "plain_text", text: "A" }, value: "a" })).toBe(true);
    });

    it("accepts description", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "A" },
          value: "a",
          description: { type: "plain_text", text: "desc" },
        }),
      ).toBe(true);
    });

    it("rejects mrkdwn text (select options must be plain_text)", () => {
      expect(validate({ text: { type: "mrkdwn", text: "A" }, value: "a" })).toBe(false);
    });

    it("rejects text > 75 chars", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "x".repeat(76) },
          value: "a",
        }),
      ).toBe(false);
    });

    it("rejects value > 150 chars", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "A" },
          value: "x".repeat(151),
        }),
      ).toBe(false);
    });

    it("rejects missing value", () => {
      expect(validate({ text: { type: "plain_text", text: "A" } })).toBe(false);
    });
  });

  describe("option_object_overflow (overflow only)", () => {
    const validate = compileDef("option_object_overflow");

    it("accepts url field", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "A" },
          value: "a",
          url: "https://e.com",
        }),
      ).toBe(true);
    });

    it("rejects url > 3000 chars", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "A" },
          value: "a",
          url: `https://e.com/${"x".repeat(3000)}`,
        }),
      ).toBe(false);
    });
  });

  describe("option_object_radio_or_checkbox (allows mrkdwn)", () => {
    const validate = compileDef("option_object_radio_or_checkbox");

    it("accepts plain_text", () => {
      expect(validate({ text: { type: "plain_text", text: "A" }, value: "a" })).toBe(true);
    });

    it("accepts mrkdwn", () => {
      expect(validate({ text: { type: "mrkdwn", text: "*A*" }, value: "a" })).toBe(true);
    });

    it("rejects url (overflow-only)", () => {
      expect(
        validate({
          text: { type: "plain_text", text: "A" },
          value: "a",
          url: "https://e.com",
        }),
      ).toBe(false);
    });
  });

  describe("option_group_object", () => {
    const validate = compileDef("option_group_object");

    it("accepts minimal", () => {
      expect(
        validate({
          label: { type: "plain_text", text: "G" },
          options: [{ text: { type: "plain_text", text: "A" }, value: "a" }],
        }),
      ).toBe(true);
    });

    it("rejects label > 75 chars", () => {
      expect(
        validate({
          label: { type: "plain_text", text: "x".repeat(76) },
          options: [{ text: { type: "plain_text", text: "A" }, value: "a" }],
        }),
      ).toBe(false);
    });

    it("rejects empty options", () => {
      expect(validate({ label: { type: "plain_text", text: "G" }, options: [] })).toBe(false);
    });

    it("rejects 101 options", () => {
      expect(
        validate({
          label: { type: "plain_text", text: "G" },
          options: Array.from({ length: 101 }, (_, i) => ({
            text: { type: "plain_text", text: `o${i}` },
            value: `v${i}`,
          })),
        }),
      ).toBe(false);
    });
  });

  describe("slack_file_object", () => {
    const validate = compileDef("slack_file_object");

    it("accepts url only", () => {
      expect(validate({ url: "https://e.com/f.png" })).toBe(true);
    });

    it("accepts id only", () => {
      expect(validate({ id: "F1" })).toBe(true);
    });

    it("rejects both url and id", () => {
      expect(validate({ url: "https://e.com/f.png", id: "F1" })).toBe(false);
    });

    it("rejects neither", () => {
      expect(validate({})).toBe(false);
    });
  });

  describe("dispatch_action_config_object", () => {
    const validate = compileDef("dispatch_action_config_object");

    it("accepts single trigger", () => {
      expect(validate({ trigger_actions_on: ["on_enter_pressed"] })).toBe(true);
    });

    it("accepts both triggers", () => {
      expect(
        validate({
          trigger_actions_on: ["on_enter_pressed", "on_character_entered"],
        }),
      ).toBe(true);
    });

    it("rejects empty array", () => {
      expect(validate({ trigger_actions_on: [] })).toBe(false);
    });

    it("rejects duplicate triggers", () => {
      expect(
        validate({
          trigger_actions_on: ["on_enter_pressed", "on_enter_pressed"],
        }),
      ).toBe(false);
    });

    it("rejects unknown trigger", () => {
      expect(validate({ trigger_actions_on: ["on_paste"] })).toBe(false);
    });
  });

  describe("conversation_filter_object", () => {
    const validate = compileDef("conversation_filter_object");

    it("accepts include only", () => {
      expect(validate({ include: ["public"] })).toBe(true);
    });

    it("accepts exclude flags only", () => {
      expect(
        validate({
          exclude_external_shared_channels: true,
          exclude_bot_users: true,
        }),
      ).toBe(true);
    });

    it("rejects empty object", () => {
      expect(validate({})).toBe(false);
    });

    it("rejects empty include array", () => {
      expect(validate({ include: [] })).toBe(false);
    });

    it("rejects duplicate include values", () => {
      expect(validate({ include: ["public", "public"] })).toBe(false);
    });

    it("rejects unknown include value", () => {
      expect(validate({ include: ["team"] })).toBe(false);
    });

    it("accepts all four include values", () => {
      expect(validate({ include: ["im", "mpim", "private", "public"] })).toBe(true);
    });
  });

  describe("trigger_object", () => {
    const validate = compileDef("trigger_object");

    it("accepts url only", () => {
      expect(validate({ url: "https://slack.com/shortcuts/abc/xyz" })).toBe(true);
    });

    it("accepts customizable_input_parameters", () => {
      expect(
        validate({
          url: "https://slack.com/shortcuts/abc/xyz",
          customizable_input_parameters: [{ name: "p1", value: "v1" }],
        }),
      ).toBe(true);
    });

    it("rejects missing url", () => {
      expect(validate({})).toBe(false);
    });

    it("rejects input parameter missing name", () => {
      expect(
        validate({
          url: "https://slack.com/shortcuts/abc/xyz",
          customizable_input_parameters: [{ value: "v1" }],
        }),
      ).toBe(false);
    });
  });

  describe("workflow_object", () => {
    const validate = compileDef("workflow_object");

    it("accepts with trigger", () => {
      expect(
        validate({
          trigger: { url: "https://slack.com/shortcuts/abc/xyz" },
        }),
      ).toBe(true);
    });

    it("rejects missing trigger", () => {
      expect(validate({})).toBe(false);
    });
  });
});
