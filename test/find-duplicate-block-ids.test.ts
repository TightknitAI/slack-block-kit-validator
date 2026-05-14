import { findDuplicateBlockIds } from "../src/helpers/find-duplicate-block-ids";

describe("findDuplicateBlockIds", () => {
  it("returns no errors when all block_ids are unique", () => {
    expect(findDuplicateBlockIds([{ block_id: "a" }, { block_id: "b" }, { block_id: "c" }])).toEqual([]);
  });

  it("returns no errors when blocks have no block_id", () => {
    expect(findDuplicateBlockIds([{}, {}, {}])).toEqual([]);
  });

  it("flags a duplicate block_id with indices of both occurrences", () => {
    const errors = findDuplicateBlockIds([{ block_id: "a" }, { block_id: "b" }, { block_id: "a" }]);
    expect(errors).toEqual(["blocks[2].block_id must be unique — 'a' appears at index 0 and 2"]);
  });

  it("flags multiple duplicates independently", () => {
    const errors = findDuplicateBlockIds([
      { block_id: "a" },
      { block_id: "b" },
      { block_id: "a" },
      { block_id: "b" },
      { block_id: "a" },
    ]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toContain("'a' appears at index 0 and 2");
    expect(errors[1]).toContain("'b' appears at index 1 and 3");
    expect(errors[2]).toContain("'a' appears at index 0 and 4");
  });

  it("ignores blocks with undefined block_id while flagging duplicates elsewhere", () => {
    const errors = findDuplicateBlockIds([{ block_id: "a" }, {}, { block_id: "a" }]);
    expect(errors).toEqual(["blocks[2].block_id must be unique — 'a' appears at index 0 and 2"]);
  });

  it("accepts an empty array", () => {
    expect(findDuplicateBlockIds([])).toEqual([]);
  });

  it("skips markdown blocks (Slack drops their block_id on send)", () => {
    expect(
      findDuplicateBlockIds([
        { type: "markdown", block_id: "x" },
        { type: "markdown", block_id: "x" },
      ]),
    ).toEqual([]);
  });

  it("treats markdown + non-markdown with the same block_id as non-duplicate", () => {
    expect(
      findDuplicateBlockIds([
        { type: "markdown", block_id: "x" },
        { type: "section", block_id: "x" },
      ]),
    ).toEqual([]);
  });
});
