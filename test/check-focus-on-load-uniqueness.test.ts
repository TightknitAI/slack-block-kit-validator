import { checkFocusOnLoadUniqueness } from "../src/helpers/check-focus-on-load-uniqueness";

describe("checkFocusOnLoadUniqueness", () => {
  it("returns no errors when no element has focus_on_load", () => {
    expect(
      checkFocusOnLoadUniqueness([
        {
          type: "input",
          element: { type: "plain_text_input", action_id: "a" },
        },
      ]),
    ).toEqual([]);
  });

  it("returns no errors when exactly one element has focus_on_load", () => {
    expect(
      checkFocusOnLoadUniqueness([
        {
          type: "input",
          element: { type: "plain_text_input", focus_on_load: true },
        },
        { type: "divider" },
      ]),
    ).toEqual([]);
  });

  it("ignores focus_on_load: false", () => {
    expect(
      checkFocusOnLoadUniqueness([
        {
          type: "input",
          element: { type: "plain_text_input", focus_on_load: false },
        },
        {
          type: "input",
          element: { type: "plain_text_input", focus_on_load: false },
        },
      ]),
    ).toEqual([]);
  });

  it("flags multiple focus_on_load: true elements across nested structures", () => {
    const errors = checkFocusOnLoadUniqueness([
      {
        type: "input",
        element: { type: "plain_text_input", focus_on_load: true },
      },
      {
        type: "actions",
        elements: [{ type: "datepicker", focus_on_load: true }, { type: "button" }],
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("2");
    expect(errors[0]).toContain("blocks[0].element");
    expect(errors[0]).toContain("blocks[1].elements[0]");
  });

  it("finds focus_on_load inside a section accessory", () => {
    const errors = checkFocusOnLoadUniqueness([
      {
        type: "section",
        accessory: { type: "datepicker", focus_on_load: true },
      },
      {
        type: "input",
        element: { type: "plain_text_input", focus_on_load: true },
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("blocks[0].accessory");
    expect(errors[0]).toContain("blocks[1].element");
  });

  it("accepts an empty array", () => {
    expect(checkFocusOnLoadUniqueness([])).toEqual([]);
  });
});
