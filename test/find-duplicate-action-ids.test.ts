import { findDuplicateActionIds } from "../src/helpers/find-duplicate-action-ids";

const button = (action_id?: string) => ({
  type: "button",
  text: { type: "plain_text", text: "Go", emoji: true },
  ...(action_id === undefined ? {} : { action_id }),
});

describe("findDuplicateActionIds", () => {
  it("returns no errors when action_ids within a block are unique", () => {
    expect(findDuplicateActionIds([{ type: "actions", elements: [button("a"), button("b")] }])).toEqual([]);
  });

  it("returns no errors when elements have no action_id", () => {
    expect(findDuplicateActionIds([{ type: "actions", elements: [button(), button()] }])).toEqual([]);
  });

  it("flags a duplicate action_id in an actions block with both positions", () => {
    expect(findDuplicateActionIds([{ type: "actions", elements: [button("123"), button("123")] }])).toEqual([
      "blocks[0].elements[1].action_id must be unique within the block — '123' appears at elements[0] and elements[1]",
    ]);
  });

  it("flags each repeat of the same action_id independently", () => {
    const errors = findDuplicateActionIds([
      { type: "actions", elements: [button("a"), button("b"), button("a"), button("a")] },
    ]);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain("'a' appears at elements[0] and elements[2]");
    expect(errors[1]).toContain("'a' appears at elements[0] and elements[3]");
  });

  it("allows the same action_id in two different blocks (state.values is keyed by block_id first)", () => {
    expect(
      findDuplicateActionIds([
        { type: "actions", block_id: "one", elements: [button("a")] },
        { type: "actions", block_id: "two", elements: [button("a")] },
        { type: "section", text: { type: "mrkdwn", text: "hi" }, accessory: button("a") },
      ]),
    ).toEqual([]);
  });

  it("flags duplicates in a context_actions block", () => {
    const errors = findDuplicateActionIds([
      {
        type: "context_actions",
        elements: [
          { type: "icon_button", icon: "bolt", action_id: "x" },
          { type: "icon_button", icon: "bolt", action_id: "x" },
        ],
      },
    ]);
    expect(errors).toEqual([
      "blocks[0].elements[1].action_id must be unique within the block — 'x' appears at elements[0] and elements[1]",
    ]);
  });

  it("flags duplicates across a card block's actions", () => {
    expect(findDuplicateActionIds([{ type: "card", actions: [button("go"), button("go")] }])).toEqual([
      "blocks[0].actions[1].action_id must be unique within the block — 'go' appears at actions[0] and actions[1]",
    ]);
  });

  it("scopes carousel cards separately and reports the offending card's path", () => {
    const errors = findDuplicateActionIds([
      {
        type: "carousel",
        elements: [
          { type: "card", actions: [button("go")] },
          { type: "card", actions: [button("go"), button("go")] },
        ],
      },
    ]);
    expect(errors).toEqual([
      "blocks[0].elements[1].actions[1].action_id must be unique within the block — 'go' appears at actions[0] and actions[1]",
    ]);
  });

  it("scopes container child blocks separately", () => {
    const errors = findDuplicateActionIds([
      {
        type: "container",
        child_blocks: [
          { type: "actions", elements: [button("go")] },
          { type: "actions", elements: [button("go"), button("go")] },
        ],
      },
    ]);
    expect(errors).toEqual([
      "blocks[0].child_blocks[1].elements[1].action_id must be unique within the block — 'go' appears at elements[0] and elements[1]",
    ]);
  });

  it("shares one namespace across an input block's element and any sibling keys", () => {
    expect(
      findDuplicateActionIds([
        {
          type: "input",
          label: { type: "plain_text", text: "Name" },
          element: { type: "plain_text_input", action_id: "a" },
        },
      ]),
    ).toEqual([]);
  });

  it("ignores non-string action_ids", () => {
    expect(
      findDuplicateActionIds([{ type: "actions", elements: [{ action_id: 1 }, { action_id: 1 }, null, "nope"] }]),
    ).toEqual([]);
  });

  it("accepts an empty array", () => {
    expect(findDuplicateActionIds([])).toEqual([]);
  });

  it("terminates on pathologically nested containers", () => {
    let block: unknown = { type: "actions", elements: [button("a"), button("a")] };
    for (let i = 0; i < 200; i++) {
      block = { type: "container", child_blocks: [block] };
    }
    expect(findDuplicateActionIds([block])).toEqual([]);
  });
});
