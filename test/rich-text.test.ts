import { compileDef } from "./helpers/compile-def";

describe("rich text", () => {
  describe("rich_text_section_element", () => {
    const validate = compileDef("rich_text_section_element");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "rich_text_section",
          elements: [{ type: "text", text: "x" }],
        }),
      ).toBe(true);
    });

    it("accepts empty elements (Slack allows this)", () => {
      expect(validate({ type: "rich_text_section", elements: [] })).toBe(true);
    });

    it("rejects wrong type", () => {
      expect(validate({ type: "rich_text_list", elements: [] })).toBe(false);
    });
  });

  describe("rich_text_list_element", () => {
    const validate = compileDef("rich_text_list_element");

    it("accepts bullet list", () => {
      expect(
        validate({
          type: "rich_text_list",
          style: "bullet",
          elements: [{ type: "rich_text_section", elements: [] }],
        }),
      ).toBe(true);
    });

    it("accepts ordered list with indent/offset/border", () => {
      expect(
        validate({
          type: "rich_text_list",
          style: "ordered",
          indent: 1,
          offset: 5,
          border: 1,
          elements: [{ type: "rich_text_section", elements: [] }],
        }),
      ).toBe(true);
    });

    it("rejects unknown style", () => {
      expect(
        validate({
          type: "rich_text_list",
          style: "roman",
          elements: [{ type: "rich_text_section", elements: [] }],
        }),
      ).toBe(false);
    });

    it("rejects border other than 0/1", () => {
      expect(
        validate({
          type: "rich_text_list",
          style: "bullet",
          border: 2,
          elements: [{ type: "rich_text_section", elements: [] }],
        }),
      ).toBe(false);
    });

    it("rejects a non-section child", () => {
      expect(
        validate({
          type: "rich_text_list",
          style: "bullet",
          elements: [{ type: "rich_text_preformatted", elements: [] }],
        }),
      ).toBe(false);
    });

    it("rejects empty elements (list must have at least one section)", () => {
      expect(validate({ type: "rich_text_list", style: "bullet", elements: [] })).toBe(false);
    });
  });

  describe("rich_text_preformatted_element", () => {
    const validate = compileDef("rich_text_preformatted_element");

    it("accepts with language", () => {
      expect(
        validate({
          type: "rich_text_preformatted",
          elements: [{ type: "text", text: "console.log(1)" }],
          language: "javascript",
        }),
      ).toBe(true);
    });

    it("accepts empty elements", () => {
      expect(validate({ type: "rich_text_preformatted", elements: [] })).toBe(true);
    });
  });

  describe("rich_text_quote_element", () => {
    const validate = compileDef("rich_text_quote_element");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "rich_text_quote",
          elements: [{ type: "text", text: "quoted" }],
        }),
      ).toBe(true);
    });
  });

  describe("leaf: text", () => {
    const validate = compileDef("rich_text_text_leaf");

    it("accepts minimal", () => {
      expect(validate({ type: "text", text: "hello" })).toBe(true);
    });

    it("accepts with style", () => {
      expect(
        validate({
          type: "text",
          text: "hello",
          style: { bold: true, italic: true, code: true },
        }),
      ).toBe(true);
    });

    it("rejects empty style object", () => {
      expect(validate({ type: "text", text: "x", style: {} })).toBe(false);
    });

    it("rejects unknown style flag", () => {
      expect(validate({ type: "text", text: "x", style: { flashing: true } })).toBe(false);
    });
  });

  describe("leaf: link", () => {
    const validate = compileDef("rich_text_link_leaf");

    it("accepts minimal", () => {
      expect(validate({ type: "link", url: "https://e.com" })).toBe(true);
    });

    it("accepts with text + unsafe + style", () => {
      expect(
        validate({
          type: "link",
          url: "https://e.com",
          text: "Click",
          unsafe: false,
          style: { bold: true },
        }),
      ).toBe(true);
    });

    it("rejects missing url", () => {
      expect(validate({ type: "link" })).toBe(false);
    });
  });

  describe("leaf: user", () => {
    const validate = compileDef("rich_text_user_leaf");

    it("accepts U-prefix", () => {
      expect(validate({ type: "user", user_id: "U123ABC" })).toBe(true);
    });

    it("accepts W-prefix (enterprise grid user)", () => {
      expect(validate({ type: "user", user_id: "W123ABC" })).toBe(true);
    });

    it("rejects T-prefix (team, not user)", () => {
      expect(validate({ type: "user", user_id: "T123ABC" })).toBe(false);
    });
  });

  describe("leaf: usergroup", () => {
    const validate = compileDef("rich_text_usergroup_leaf");

    it("accepts S-prefix", () => {
      expect(validate({ type: "usergroup", usergroup_id: "S123ABC" })).toBe(true);
    });

    it("rejects U-prefix", () => {
      expect(validate({ type: "usergroup", usergroup_id: "U123ABC" })).toBe(false);
    });
  });

  describe("leaf: team", () => {
    const validate = compileDef("rich_text_team_leaf");

    it("accepts T-prefix", () => {
      expect(validate({ type: "team", team_id: "T123ABC" })).toBe(true);
    });

    it("rejects U-prefix", () => {
      expect(validate({ type: "team", team_id: "U123ABC" })).toBe(false);
    });
  });

  describe("leaf: channel", () => {
    const validate = compileDef("rich_text_channel_leaf");

    it("accepts C-prefix", () => {
      expect(validate({ type: "channel", channel_id: "C123ABC" })).toBe(true);
    });

    it("accepts G-prefix (legacy private)", () => {
      expect(validate({ type: "channel", channel_id: "G123ABC" })).toBe(true);
    });

    it("rejects D-prefix (DM)", () => {
      expect(validate({ type: "channel", channel_id: "D123ABC" })).toBe(false);
    });
  });

  describe("leaf: emoji", () => {
    const validate = compileDef("rich_text_emoji_leaf");

    it("accepts name only", () => {
      expect(validate({ type: "emoji", name: "wave" })).toBe(true);
    });

    it("accepts skin_tone 1-6", () => {
      for (const n of [1, 2, 3, 4, 5, 6]) {
        expect(validate({ type: "emoji", name: "wave", skin_tone: n })).toBe(true);
      }
    });

    it("rejects skin_tone 0 or 7", () => {
      expect(validate({ type: "emoji", name: "wave", skin_tone: 0 })).toBe(false);
      expect(validate({ type: "emoji", name: "wave", skin_tone: 7 })).toBe(false);
    });

    it("accepts unicode", () => {
      expect(validate({ type: "emoji", name: "wave", unicode: "1f44b" })).toBe(true);
    });

    it("accepts style (undocumented, but Slack accepts it)", () => {
      expect(validate({ type: "emoji", name: "wave", style: { bold: true } })).toBe(true);
    });

    it("rejects missing name", () => {
      expect(validate({ type: "emoji" })).toBe(false);
    });
  });

  describe("leaf: broadcast", () => {
    const validate = compileDef("rich_text_broadcast_leaf");

    it("accepts all three ranges", () => {
      for (const range of ["here", "channel", "everyone"]) {
        expect(validate({ type: "broadcast", range })).toBe(true);
      }
    });

    it("rejects unknown range", () => {
      expect(validate({ type: "broadcast", range: "admins" })).toBe(false);
    });
  });

  describe("leaf: color", () => {
    const validate = compileDef("rich_text_color_leaf");

    it("accepts hex with leading #", () => {
      expect(validate({ type: "color", value: "#ff00aa" })).toBe(true);
    });

    it("accepts hex without leading #", () => {
      expect(validate({ type: "color", value: "FF00AA" })).toBe(true);
    });

    it("rejects 3-char hex", () => {
      expect(validate({ type: "color", value: "#f0a" })).toBe(false);
    });

    it("rejects non-hex chars", () => {
      expect(validate({ type: "color", value: "#gg0000" })).toBe(false);
    });
  });

  describe("leaf: date", () => {
    const validate = compileDef("rich_text_date_leaf");

    it("accepts minimal", () => {
      expect(
        validate({
          type: "date",
          timestamp: 1628633820,
          format: "{date_num} at {time}",
        }),
      ).toBe(true);
    });

    it("accepts url + fallback", () => {
      expect(
        validate({
          type: "date",
          timestamp: 1628633820,
          format: "{date_pretty}",
          url: "https://e.com",
          fallback: "some date",
        }),
      ).toBe(true);
    });

    it("rejects negative timestamp", () => {
      expect(validate({ type: "date", timestamp: -1, format: "{date_pretty}" })).toBe(false);
    });

    it("rejects empty format", () => {
      expect(validate({ type: "date", timestamp: 100, format: "" })).toBe(false);
    });
  });

  describe("rich_text_block (full container)", () => {
    const validate = compileDef("rich_text_block");

    it("accepts deeply nested list + section + leaf variants", () => {
      expect(
        validate({
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                { type: "text", text: "Hi " },
                { type: "user", user_id: "U1" },
                { type: "text", text: " — ping " },
                { type: "broadcast", range: "channel" },
              ],
            },
            {
              type: "rich_text_list",
              style: "ordered",
              elements: [
                {
                  type: "rich_text_section",
                  elements: [{ type: "text", text: "one" }],
                },
                {
                  type: "rich_text_section",
                  elements: [{ type: "text", text: "two" }],
                },
              ],
            },
            {
              type: "rich_text_preformatted",
              language: "javascript",
              elements: [{ type: "text", text: "console.log(1)" }],
            },
            {
              type: "rich_text_quote",
              elements: [{ type: "text", text: "quoted" }],
            },
          ],
        }),
      ).toBe(true);
    });
  });
});
