import { validateBlockKit } from "../src/validate-block-kit";

describe("validateBlockKit", () => {
  describe("target: blocks (default)", () => {
    it("accepts a valid blocks array", () => {
      const result = validateBlockKit([{ type: "section", text: { type: "mrkdwn", text: "hi" } }]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("returns structural errors from the schema", () => {
      const result = validateBlockKit([{ type: "section" }]);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("combines schema errors with caveat helpers", () => {
      const result = validateBlockKit([
        { type: "table", rows: [[{ type: "raw_text", text: "a" }]] },
        { type: "table", rows: [[{ type: "raw_text", text: "b" }]] },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("only one 'table' block"))).toBe(true);
    });

    it("accepts a single plan block", () => {
      const result = validateBlockKit([{ type: "plan", title: "Sprint plan" }]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("flags more than one plan block", () => {
      const result = validateBlockKit([
        { type: "plan", title: "Plan A" },
        { type: "plan", title: "Plan B" },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("only one 'plan' block"))).toBe(true);
    });

    it("accepts up to two data_visualization blocks in a message", () => {
      const viz = (id: string) => ({
        type: "data_visualization",
        block_id: id,
        title: "Chart",
        chart: { type: "pie", segments: [{ label: "Free", value: 1 }] },
      });
      const result = validateBlockKit([viz("a"), viz("b")]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("flags more than two data_visualization blocks", () => {
      const viz = (id: string) => ({
        type: "data_visualization",
        block_id: id,
        title: "Chart",
        chart: { type: "pie", segments: [{ label: "Free", value: 1 }] },
      });
      const result = validateBlockKit([viz("a"), viz("b"), viz("c")]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("data_visualization"))).toBe(true);
    });

    it("flags a chart data point whose label is not a declared category", () => {
      const result = validateBlockKit([
        {
          type: "data_visualization",
          title: "Weekly active users",
          chart: {
            type: "line",
            series: [
              {
                name: "Desktop",
                data: [
                  { label: "Mon", value: 1 },
                  { label: "Xyz", value: 2 },
                ],
              },
            ],
            axis_config: { categories: ["Mon", "Tue"] },
          },
        },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("'Xyz'"))).toBe(true);
    });

    it("flags duplicate block_ids", () => {
      const result = validateBlockKit([
        { type: "divider", block_id: "x" },
        { type: "divider", block_id: "x" },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be unique"))).toBe(true);
    });

    it("flags cumulative markdown over 12k", () => {
      const result = validateBlockKit([
        { type: "markdown", text: "a".repeat(7000) },
        { type: "markdown", text: "b".repeat(6000) },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("cumulative markdown"))).toBe(true);
    });

    it("flags multiple focus_on_load: true", () => {
      const result = validateBlockKit([
        {
          type: "input",
          label: { type: "plain_text", text: "a" },
          element: {
            type: "plain_text_input",
            action_id: "a",
            focus_on_load: true,
          },
        },
        {
          type: "input",
          label: { type: "plain_text", text: "b" },
          element: {
            type: "plain_text_input",
            action_id: "b",
            focus_on_load: true,
          },
        },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("focus_on_load: true"))).toBe(true);
    });
  });

  describe("surface compatibility", () => {
    it("rejects alert block on message surface (alert is modal-only per docs)", () => {
      const result = validateBlockKit([{ type: "alert", text: { type: "mrkdwn", text: "hi" } }], {
        surface: "message",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("'alert'"))).toBe(true);
    });

    it("rejects table block on modal surface via target=modal", () => {
      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "hi" },
          blocks: [{ type: "table", rows: [[{ type: "raw_text", text: "a" }]] }],
        },
        { target: "modal" },
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("'table'"))).toBe(true);
    });
  });

  describe("target: modal", () => {
    it("accepts a valid modal view", () => {
      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "Hi" },
          blocks: [{ type: "divider" }],
        },
        { target: "modal" },
      );
      expect(result.valid).toBe(true);
    });

    it("rejects modal title over 24 chars", () => {
      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "x".repeat(25) },
          blocks: [{ type: "divider" }],
        },
        { target: "modal" },
      );
      expect(result.valid).toBe(false);
    });
  });

  describe("undefined property normalization", () => {
    it("ignores properties explicitly set to undefined (mirrors JSON.stringify)", () => {
      // Builder patterns like `value: x ?? undefined` produce explicit-undefined
      // properties that `JSON.stringify` drops before Slack ever sees them.
      // The validator should do the same, so `additionalProperties: false` in
      // the schema does not fire on these no-op fields.
      const option = {
        text: { type: "plain_text", text: "Only option", emoji: true },
        value: "only",
        url: undefined,
      };

      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "Pick one" },
          submit: { type: "plain_text", text: "Save" },
          blocks: [
            {
              type: "input",
              label: { type: "plain_text", text: "Choice" },
              element: {
                type: "static_select",
                action_id: "choice",
                options: [option],
                initial_option: option,
              },
            },
          ],
        },
        { target: "modal" },
      );

      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    });

    it("recurses through nested arrays and objects", () => {
      const result = validateBlockKit([
        {
          type: "section",
          text: { type: "mrkdwn", text: "hi", verbatim: undefined },
          block_id: undefined,
        },
      ]);
      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    });

    it("preserves explicit null values (distinct from undefined)", () => {
      // `null` is a legal JSON value that `JSON.stringify` keeps, so the
      // validator must not strip it — the schema may accept or reject nulls
      // on its own terms.
      const result = validateBlockKit([
        {
          type: "section",
          text: { type: "mrkdwn", text: "hi" },
          block_id: null,
        },
      ]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("block_id"))).toBe(true);
    });

    it("does not mutate the caller-provided input", () => {
      const option = {
        text: { type: "plain_text", text: "Only option", emoji: true },
        value: "only",
        url: undefined as string | undefined,
      };
      const originalKeys = Object.keys(option);

      validateBlockKit([
        {
          type: "actions",
          elements: [
            {
              type: "static_select",
              action_id: "a",
              options: [option],
            },
          ],
        },
      ]);

      expect(Object.keys(option)).toEqual(originalKeys);
      expect("url" in option).toBe(true);
    });

    it("converts sparse array holes to null (matching JSON.stringify)", () => {
      // `JSON.stringify([, 1])` → `'[null,1]'`. `Array.prototype.map` skips
      // holes entirely, which would leave the slot as `undefined` after a naive
      // traversal and confuse schemas that accept null placeholders.

      // biome-ignore lint/suspicious/noSparseArray: deliberately testing sparse array behavior
      const sparse = [, { align: "left" }];
      const payload = [
        {
          type: "table",
          rows: [[{ type: "raw_text", text: "a" }]],
          column_settings: sparse,
        },
      ];
      const result = validateBlockKit(payload);
      expect(result.errors.some((e) => e.includes("column_settings") || e.includes("undefined"))).toBe(false);
    });

    it("converts undefined array slots to null (matching JSON.stringify)", () => {
      // `JSON.stringify([undefined])` → `'[null]'`. Schemas that accept
      // explicit null placeholders (e.g. `table_block.column_settings`) should
      // still pass when the builder used `undefined` in array slots.
      const payload = [
        {
          type: "table",
          rows: [[{ type: "raw_text", text: "a" }]],
          column_settings: [undefined, { align: "left" }],
        },
      ];

      const result = validateBlockKit(payload);
      // column_settings nulls are valid per the schema; the only shape issue
      // would come from other unrelated rules — assert no error mentions
      // column_settings or array slot normalization.
      expect(result.errors.some((e) => e.includes("column_settings") || e.includes("undefined"))).toBe(false);
    });

    it("does not propagate prototype-pollution keys through normalization", () => {
      // A payload with `__proto__`, `constructor`, or `prototype` as an own
      // key must not mutate `Object.prototype` — the walker should skip those
      // keys instead of assigning them via bracket notation.
      const pollutedOption = JSON.parse(
        '{"text":{"type":"plain_text","text":"hi"},"value":"v","__proto__":{"polluted":"yes"}}',
      );

      validateBlockKit([
        {
          type: "actions",
          elements: [
            {
              type: "static_select",
              action_id: "a",
              options: [pollutedOption],
            },
          ],
        },
      ]);

      // Confirm no pollution leaked through. Using `{} as { polluted?: unknown }`
      // avoids a dependency on how the test runner structures its globals.
      expect(({} as { polluted?: unknown }).polluted).toBeUndefined();
    });

    it("does not stack-overflow on deeply nested input (depth-limited walk)", () => {
      // Build a payload nested well past the internal depth cap to make sure
      // stripUndefined returns rather than recursing forever.
      let node: Record<string, unknown> = { leaf: "x" };
      for (let i = 0; i < 1000; i++) {
        node = { nested: node };
      }

      expect(() => validateBlockKit([node])).not.toThrow();
    });
  });

  describe("target: home", () => {
    it("accepts a valid home view", () => {
      const result = validateBlockKit(
        {
          type: "home",
          blocks: [{ type: "section", text: { type: "mrkdwn", text: "hi" } }],
        },
        { target: "home" },
      );
      expect(result.valid).toBe(true);
    });

    it("accepts home view with input block (home tabs support input)", () => {
      const result = validateBlockKit(
        {
          type: "home",
          blocks: [
            {
              type: "input",
              label: { type: "plain_text", text: "a" },
              element: { type: "plain_text_input", action_id: "a" },
            },
          ],
        },
        { target: "home" },
      );
      expect(result.valid).toBe(true);
    });
  });
});
