import { CARD_ACTIONS_MAX, checkCardActionsMax } from "../src/helpers/check-card-actions-max";

const button = (id: string) => ({
  type: "button",
  text: { type: "plain_text", text: "Go" },
  action_id: id,
});

describe("checkCardActionsMax", () => {
  it("returns no errors when there are no card blocks", () => {
    expect(checkCardActionsMax([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("returns no errors when a card has no actions", () => {
    expect(checkCardActionsMax([{ type: "card" }])).toEqual([]);
  });

  it("accepts a card with one action button", () => {
    expect(checkCardActionsMax([{ type: "card", actions: [button("a")] }])).toEqual([]);
  });

  it(`accepts a card with exactly ${CARD_ACTIONS_MAX} action buttons`, () => {
    expect(checkCardActionsMax([{ type: "card", actions: [button("a"), button("b")] }])).toEqual([]);
  });

  it(`flags a card with more than ${CARD_ACTIONS_MAX} action buttons`, () => {
    const errors = checkCardActionsMax([{ type: "card", actions: [button("a"), button("b"), button("c")] }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("blocks[0].actions");
    expect(errors[0]).toContain("3");
  });

  it("flags each offending card independently", () => {
    const errors = checkCardActionsMax([
      { type: "card", actions: [button("a")] },
      { type: "section" },
      {
        type: "card",
        actions: [button("a"), button("b"), button("c"), button("d")],
      },
      { type: "card", actions: [button("a"), button("b"), button("c")] },
    ]);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain("blocks[2].actions");
    expect(errors[1]).toContain("blocks[3].actions");
  });

  it("accepts an empty array", () => {
    expect(checkCardActionsMax([])).toEqual([]);
  });
});
