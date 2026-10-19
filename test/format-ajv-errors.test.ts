import { validateBlockKit } from "../src/validate-block-kit";

describe("error formatting", () => {
  describe("path normalization", () => {
    it("uses blocks[N] form, not /N JSON-pointer form", () => {
      const result = validateBlockKit([{ type: "section" }]);
      for (const err of result.errors) {
        expect(err).toMatch(/^blocks\[0\]/);
      }
    });

    it("uses blocks[N] form inside a modal envelope", () => {
      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "x" },
          blocks: [{ type: "section" }],
        },
        { target: "modal" },
      );
      expect(result.errors.some((e) => e.startsWith("blocks[0]"))).toBe(true);
    });
  });

  describe("focused-branch error collapsing", () => {
    it("returns only section-branch errors for a malformed section block", () => {
      const result = validateBlockKit([{ type: "section" }]);
      // Pre-improvement this returned ~80 errors covering every block kind.
      // The focused branch should report only that text or fields is missing.
      expect(result.errors.length).toBeLessThanOrEqual(3);
      expect(result.errors.some((e) => e.includes("missing required property 'text'"))).toBe(true);
      expect(result.errors.some((e) => e.includes("missing required property 'fields'"))).toBe(true);
      // No errors mentioning other block kinds should leak through.
      const noise = result.errors.filter(
        (e) =>
          e.includes('expected "actions"') ||
          e.includes('expected "divider"') ||
          e.includes('expected "image"') ||
          e.includes('expected "input"'),
      );
      expect(noise).toEqual([]);
    });

    it("suppresses umbrella oneOf/anyOf messages when underlying errors are reported", () => {
      const result = validateBlockKit([{ type: "section", block_id: "x" }]);
      // anyOf is the schema's way of saying "needs text OR fields". The
      // underlying 'required' errors already say so explicitly.
      expect(result.errors.some((e) => e.includes("must match a schema in anyOf"))).toBe(false);
      expect(result.errors.some((e) => e.includes("must match exactly one schema in oneOf"))).toBe(false);
    });

    it("returns a single line for an unknown property on a known block", () => {
      const result = validateBlockKit([
        { type: "section", text: { type: "mrkdwn", text: "hi" }, totally_made_up: true },
      ]);
      expect(result.errors).toEqual(["blocks[0]: unknown property 'totally_made_up'"]);
    });
  });

  describe("unrecognized / malformed block.type", () => {
    it("missing type → a single 'missing required property type' error", () => {
      const r = validateBlockKit([{}]);
      expect(r.valid).toBe(false);
      expect(r.errors).toEqual(["blocks[0]: missing required property 'type'"]);
    });

    it("non-string type → a single shape error", () => {
      const r = validateBlockKit([{ type: 42 }]);
      expect(r.valid).toBe(false);
      expect(r.errors).toEqual(["blocks[0].type: expected string, got number"]);
    });

    it("null type → null-specific shape error", () => {
      const r = validateBlockKit([{ type: null }]);
      expect(r.valid).toBe(false);
      expect(r.errors).toEqual(["blocks[0].type: expected string, got null"]);
    });

    it("unknown string type → a single 'not a recognized block kind' error", () => {
      const r = validateBlockKit([{ type: "totally_made_up" }]);
      expect(r.valid).toBe(false);
      expect(r.errors).toEqual(["blocks[0].type: 'totally_made_up' is not a recognized block kind"]);
    });

    it("null block → a single shape error, no oneOf/not noise", () => {
      const r = validateBlockKit([null]);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes("must NOT be valid"))).toBe(false);
      expect(r.errors.some((e) => e.includes("expected object"))).toBe(true);
    });
  });

  describe("friendly per-keyword messages", () => {
    it("required → missing required property '<name>'", () => {
      const result = validateBlockKit([{ type: "section" }]);
      expect(result.errors).toContain("blocks[0]: missing required property 'text'");
    });

    it("additionalProperties → unknown property '<name>'", () => {
      const result = validateBlockKit([{ type: "section", text: { type: "mrkdwn", text: "hi" }, junk: 1 }]);
      expect(result.errors).toContain("blocks[0]: unknown property 'junk'");
    });

    it("maxLength → longer than N characters", () => {
      const result = validateBlockKit([{ type: "header", text: { type: "plain_text", text: "x".repeat(200) } }]);
      expect(result.errors).toContain("blocks[0].text.text: longer than 150 characters");
    });

    it("format → not a valid <format>", () => {
      const result = validateBlockKit([{ type: "image", image_url: "not a url", alt_text: "x" }]);
      expect(result.errors).toContain("blocks[0].image_url: not a valid uri");
    });

    it("const → expected '<value>'", () => {
      // A header's text can only be plain_text, so this is a single const.
      const result = validateBlockKit([{ type: "header", text: { type: "mrkdwn", text: "hi" } }]);
      expect(result.errors).toEqual(['blocks[0].text.type: expected "plain_text"']);
    });
  });

  describe("element unions narrowed to the element's own kind", () => {
    const button = { type: "button", text: { type: "plain_text", text: "Go" }, action_id: "go" };

    it("reports only the failing field of an element in a union of element kinds", () => {
      // Pre-narrowing this was 23 errors: the real one plus a mismatch against
      // every other kind an actions block accepts.
      const result = validateBlockKit([
        { type: "actions", elements: [{ ...button, url: `https://example.com/?q=${"a".repeat(3000)}` }] },
      ]);
      expect(result.errors).toEqual(["blocks[0].elements[0].url: longer than 3000 characters"]);
    });

    it("narrows a section accessory", () => {
      const result = validateBlockKit([
        { type: "section", text: { type: "mrkdwn", text: "x" }, accessory: { type: "overflow", action_id: "o" } },
      ]);
      expect(result.errors).toEqual(["blocks[0].accessory: missing required property 'options'"]);
    });

    it("narrows unions nested in unions (rich text)", () => {
      const result = validateBlockKit([
        { type: "rich_text", elements: [{ type: "rich_text_section", elements: [{ type: "text" }] }] },
      ]);
      expect(result.errors).toEqual(["blocks[0].elements[0].elements[0]: missing required property 'text'"]);
    });

    it("names the kinds a slot takes for an element kind that doesn't exist", () => {
      const result = validateBlockKit([{ type: "section", text: { type: "bogus", text: "hi" } }]);
      expect(result.errors).toEqual(['blocks[0].text.type: expected one of ["plain_text", "mrkdwn"]']);
    });

    it("names the kinds a slot takes for a real element kind it doesn't take", () => {
      const result = validateBlockKit([{ type: "context_actions", elements: [button] }]);
      expect(result.errors).toEqual([
        'blocks[0].elements[0].type: expected one of ["feedback_buttons", "icon_button"]',
      ]);
    });

    it("reports a single missing type for an element without one", () => {
      const result = validateBlockKit([{ type: "actions", elements: [{ text: { type: "plain_text", text: "Go" } }] }]);
      expect(result.errors).toEqual(["blocks[0].elements[0]: missing required property 'type'"]);
    });

    it("keeps the errors of every element, not just the first", () => {
      const result = validateBlockKit([
        {
          type: "actions",
          elements: [
            { ...button, action_id: "a", url: `https://example.com/?q=${"a".repeat(3000)}` },
            { type: "overflow", action_id: "b" },
          ],
        },
      ]);
      expect(result.errors).toEqual([
        "blocks[0].elements[0].url: longer than 3000 characters",
        "blocks[0].elements[1]: missing required property 'options'",
      ]);
    });
  });
});
