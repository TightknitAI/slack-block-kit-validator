import * as fc from "fast-check";
import { checkFocusOnLoadUniqueness } from "../src/helpers/check-focus-on-load-uniqueness";
import { checkNumberInputBounds } from "../src/helpers/check-number-input-bounds";
import { findDuplicateBlockIds } from "../src/helpers/find-duplicate-block-ids";
import { validateBlockKit } from "../src/validate-block-kit";

// Property-based tests for the recursive walkers and the stripUndefined
// normalization step. These complement the example-based tests by generating
// adversarial inputs that random-but-bounded JSON structures can produce —
// deep nesting, prototype-pollution keys, mixed undefined/null/values, etc.

const arbAnything = (): fc.Arbitrary<unknown> =>
  fc.anything({
    maxDepth: 6,
    maxKeys: 6,
    withBoxedValues: false,
    withDate: false,
    withMap: false,
    withSet: false,
    withTypedArray: false,
    withObjectString: false,
  });

describe("property: helpers return without throwing on arbitrary input", () => {
  it("findDuplicateBlockIds tolerates any array of unknown shapes", () => {
    fc.assert(
      fc.property(fc.array(arbAnything(), { maxLength: 30 }), (xs) => {
        const errs = findDuplicateBlockIds(xs as never);
        expect(Array.isArray(errs)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it("checkFocusOnLoadUniqueness terminates on deeply nested input", () => {
    fc.assert(
      fc.property(fc.array(arbAnything(), { maxLength: 10 }), (xs) => {
        const errs = checkFocusOnLoadUniqueness(xs);
        expect(Array.isArray(errs)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it("checkNumberInputBounds terminates on deeply nested input", () => {
    fc.assert(
      fc.property(fc.array(arbAnything(), { maxLength: 10 }), (xs) => {
        const errs = checkNumberInputBounds(xs);
        expect(Array.isArray(errs)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it("validateBlockKit never throws on arbitrary input", () => {
    fc.assert(
      fc.property(arbAnything(), (x) => {
        expect(() => validateBlockKit(x)).not.toThrow();
      }),
      { numRuns: 200 },
    );
  });
});

describe("property: invariants on focus_on_load uniqueness", () => {
  // Build blocks that contain exactly N elements with focus_on_load: true,
  // sprinkled at random depths inside otherwise-valid-shaped objects. The
  // helper should flag the violation iff N > 1.
  const focusedNode = fc.record({
    type: fc.constant("plain_text_input"),
    action_id: fc.string({ minLength: 1, maxLength: 10 }),
    focus_on_load: fc.constant(true),
  });

  const filler = fc.record({
    type: fc.constant("plain_text_input"),
    action_id: fc.string({ minLength: 1, maxLength: 10 }),
  });

  const blockWithN = (n: number): fc.Arbitrary<unknown[]> =>
    fc.tuple(...Array(n).fill(focusedNode), ...Array(3).fill(filler)).map((parts) => {
      // Wrap each part in an input block so the walker reaches them at varying depth.
      return parts.map((p) => ({
        type: "input",
        label: { type: "plain_text", text: "x" },
        element: p,
      }));
    });

  it("returns no errors when exactly 0 nodes are focused", () => {
    fc.assert(
      fc.property(blockWithN(0), (blocks) => {
        expect(checkFocusOnLoadUniqueness(blocks)).toEqual([]);
      }),
      { numRuns: 50 },
    );
  });

  it("returns no errors when exactly 1 node is focused", () => {
    fc.assert(
      fc.property(blockWithN(1), (blocks) => {
        expect(checkFocusOnLoadUniqueness(blocks)).toEqual([]);
      }),
      { numRuns: 50 },
    );
  });

  it("returns errors when 2+ nodes are focused", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }).chain((n) => blockWithN(n)),
        (blocks) => {
          const errs = checkFocusOnLoadUniqueness(blocks);
          expect(errs.length).toBe(1);
          expect(errs[0]).toContain("focus_on_load: true");
        },
      ),
      { numRuns: 50 },
    );
  });
});

describe("property: validateBlockKit normalization", () => {
  it("never lets prototype-pollution keys mutate Object.prototype", () => {
    const pollutedRecord = fc
      .record({
        text: fc.record({ type: fc.constant("plain_text"), text: fc.string({ minLength: 1, maxLength: 10 }) }),
        value: fc.string({ minLength: 1, maxLength: 10 }),
      })
      .map((rec) => {
        // Inject the polluter via JSON.parse so it becomes an own key (not a
        // setter on the prototype chain), matching how a payload arriving
        // from the network would carry it.
        return JSON.parse(JSON.stringify({ ...rec, __proto__: { polluted: "x" } }));
      });

    fc.assert(
      fc.property(pollutedRecord, (option) => {
        validateBlockKit([
          { type: "actions", elements: [{ type: "static_select", action_id: "a", options: [option] }] },
        ]);
        expect(({} as { polluted?: unknown }).polluted).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("does not mutate the caller-provided input on any payload", () => {
    fc.assert(
      fc.property(arbAnything(), (x) => {
        const snapshot = JSON.stringify(x);
        validateBlockKit(x);
        expect(JSON.stringify(x)).toEqual(snapshot);
      }),
      { numRuns: 100 },
    );
  });
});
