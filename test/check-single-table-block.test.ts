import { checkSingleTableBlock } from "../src/helpers/check-single-table-block";

describe("checkSingleTableBlock", () => {
  it("returns no errors when there are no table blocks", () => {
    expect(checkSingleTableBlock([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("returns no errors when there is exactly one table block", () => {
    expect(checkSingleTableBlock([{ type: "section" }, { type: "table" }])).toEqual([]);
  });

  it("returns no errors when there is exactly one data_table block", () => {
    expect(checkSingleTableBlock([{ type: "section" }, { type: "data_table" }])).toEqual([]);
  });

  it("flags multiple table blocks with their paths", () => {
    const errors = checkSingleTableBlock([
      { type: "table" },
      { type: "section" },
      { type: "table" },
      { type: "table" },
    ]);
    expect(errors).toEqual([
      "only one 'table' or 'data_table' block is allowed per message — found 3 at blocks[0], blocks[2], blocks[3]",
    ]);
  });

  it("counts table and data_table together", () => {
    expect(checkSingleTableBlock([{ type: "table" }, { type: "data_table" }])).toEqual([
      "only one 'table' or 'data_table' block is allowed per message — found 2 at blocks[0], blocks[1]",
    ]);
    expect(checkSingleTableBlock([{ type: "data_table" }, { type: "data_table" }])).toHaveLength(1);
  });

  it("counts tables nested in container.child_blocks", () => {
    const blocks = [{ type: "table" }, { type: "container", child_blocks: [{ type: "section" }, { type: "table" }] }];
    expect(checkSingleTableBlock(blocks)).toEqual([
      "only one 'table' or 'data_table' block is allowed per message — found 2 at blocks[0], blocks[1].child_blocks[1]",
    ]);
  });

  it("allows a single table nested in a container", () => {
    expect(checkSingleTableBlock([{ type: "container", child_blocks: [{ type: "table" }] }])).toEqual([]);
  });

  it("runs on message and unspecified surfaces", () => {
    const blocks = [{ type: "table" }, { type: "table" }];
    expect(checkSingleTableBlock(blocks, "message")).toHaveLength(1);
    expect(checkSingleTableBlock(blocks, undefined)).toHaveLength(1);
  });

  it("skips modal and home, where checkSurfaceCompatibility already rejects every table", () => {
    const blocks = [{ type: "table" }, { type: "data_table" }];
    expect(checkSingleTableBlock(blocks, "modal")).toEqual([]);
    expect(checkSingleTableBlock(blocks, "home")).toEqual([]);
  });

  it("tolerates null and malformed entries", () => {
    expect(
      checkSingleTableBlock([
        null,
        5,
        { type: 3 },
        { type: "container", child_blocks: [null, "x"] },
        { type: "table" },
      ]),
    ).toEqual([]);
  });

  it("accepts an empty array", () => {
    expect(checkSingleTableBlock([])).toEqual([]);
  });
});
