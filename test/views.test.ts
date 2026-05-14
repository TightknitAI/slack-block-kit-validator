import { compileDef } from "./helpers/compile-def";

describe("views", () => {
  describe("modal_view", () => {
    const validate = compileDef("modal_view");
    const minimal = {
      type: "modal",
      title: { type: "plain_text", text: "Hi" },
      blocks: [{ type: "divider" }],
    };

    it("accepts minimal", () => {
      expect(validate(minimal)).toBe(true);
    });

    it("accepts with every optional field", () => {
      expect(
        validate({
          ...minimal,
          submit: { type: "plain_text", text: "Go" },
          close: { type: "plain_text", text: "No" },
          callback_id: "cb1",
          private_metadata: JSON.stringify({ step: 1 }),
          clear_on_close: false,
          notify_on_close: true,
          external_id: "ext-1",
          submit_disabled: false,
        }),
      ).toBe(true);
    });

    it("rejects title > 24 chars", () => {
      expect(
        validate({
          ...minimal,
          title: { type: "plain_text", text: "x".repeat(25) },
        }),
      ).toBe(false);
    });

    it("rejects submit > 24 chars", () => {
      expect(
        validate({
          ...minimal,
          submit: { type: "plain_text", text: "x".repeat(25) },
        }),
      ).toBe(false);
    });

    it("rejects close > 24 chars", () => {
      expect(
        validate({
          ...minimal,
          close: { type: "plain_text", text: "x".repeat(25) },
        }),
      ).toBe(false);
    });

    it("rejects mrkdwn title", () => {
      expect(validate({ ...minimal, title: { type: "mrkdwn", text: "T" } })).toBe(false);
    });

    it("rejects mrkdwn submit", () => {
      expect(validate({ ...minimal, submit: { type: "mrkdwn", text: "Go" } })).toBe(false);
    });

    it("rejects empty blocks", () => {
      expect(validate({ ...minimal, blocks: [] })).toBe(false);
    });

    it("rejects 101 blocks", () => {
      expect(validate({ ...minimal, blocks: Array(101).fill({ type: "divider" }) })).toBe(false);
    });

    it("rejects callback_id > 255 chars", () => {
      expect(validate({ ...minimal, callback_id: "x".repeat(256) })).toBe(false);
    });

    it("rejects external_id > 255 chars", () => {
      expect(validate({ ...minimal, external_id: "x".repeat(256) })).toBe(false);
    });

    it("rejects private_metadata > 3000 chars", () => {
      expect(validate({ ...minimal, private_metadata: "x".repeat(3001) })).toBe(false);
    });

    it("rejects missing title", () => {
      const { title, ...rest } = minimal;
      expect(validate(rest)).toBe(false);
    });

    it("rejects missing blocks", () => {
      const { blocks, ...rest } = minimal;
      expect(validate(rest)).toBe(false);
    });

    it("rejects additionalProperties", () => {
      expect(validate({ ...minimal, unknown: "field" })).toBe(false);
    });

    it('rejects type: "home" (wrong discriminator)', () => {
      expect(validate({ ...minimal, type: "home" })).toBe(false);
    });

    it("rejects modal containing input blocks without submit", () => {
      expect(
        validate({
          type: "modal",
          title: { type: "plain_text", text: "M" },
          blocks: [
            {
              type: "input",
              label: { type: "plain_text", text: "Name" },
              element: { type: "plain_text_input", action_id: "n" },
            },
          ],
        }),
      ).toBe(false);
    });

    it("accepts modal containing input blocks with submit", () => {
      expect(
        validate({
          type: "modal",
          title: { type: "plain_text", text: "M" },
          submit: { type: "plain_text", text: "Save" },
          blocks: [
            {
              type: "input",
              label: { type: "plain_text", text: "Name" },
              element: { type: "plain_text_input", action_id: "n" },
            },
          ],
        }),
      ).toBe(true);
    });

    it("accepts modal without submit when no input blocks present", () => {
      expect(
        validate({
          type: "modal",
          title: { type: "plain_text", text: "M" },
          blocks: [{ type: "divider" }],
        }),
      ).toBe(true);
    });
  });

  describe("home_view", () => {
    const validate = compileDef("home_view");
    const minimal = {
      type: "home",
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "hi" } }],
    };

    it("accepts minimal", () => {
      expect(validate(minimal)).toBe(true);
    });

    it("accepts with all optional fields", () => {
      expect(
        validate({
          ...minimal,
          callback_id: "home_cb",
          private_metadata: "meta",
          external_id: "ext-1",
        }),
      ).toBe(true);
    });

    it("rejects empty blocks", () => {
      expect(validate({ ...minimal, blocks: [] })).toBe(false);
    });

    it("rejects 101 blocks", () => {
      expect(validate({ ...minimal, blocks: Array(101).fill({ type: "divider" }) })).toBe(false);
    });

    it("rejects a title field (modal-only)", () => {
      expect(validate({ ...minimal, title: { type: "plain_text", text: "x" } })).toBe(false);
    });

    it("rejects a submit field (modal-only)", () => {
      expect(validate({ ...minimal, submit: { type: "plain_text", text: "Go" } })).toBe(false);
    });

    it("rejects callback_id > 255 chars", () => {
      expect(validate({ ...minimal, callback_id: "x".repeat(256) })).toBe(false);
    });

    it("rejects additionalProperties", () => {
      expect(validate({ ...minimal, foo: "bar" })).toBe(false);
    });

    it('rejects type: "modal"', () => {
      expect(validate({ ...minimal, type: "modal" })).toBe(false);
    });

    it("accepts input block within home view blocks", () => {
      expect(
        validate({
          type: "home",
          blocks: [
            {
              type: "input",
              label: { type: "plain_text", text: "Name" },
              element: { type: "plain_text_input", action_id: "n" },
            },
          ],
        }),
      ).toBe(true);
    });
  });
});
