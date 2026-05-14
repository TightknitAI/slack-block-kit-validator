import { checkSingleTableBlock } from "../src/helpers/check-single-table-block";

describe("checkSingleTableBlock", () => {
  it("returns no errors when there are no table blocks", () => {
    expect(checkSingleTableBlock([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("returns no errors when there is exactly one table block", () => {
    expect(checkSingleTableBlock([{ type: "section" }, { type: "table" }])).toEqual([]);
  });

  it("flags multiple table blocks with their indices", () => {
    const errors = checkSingleTableBlock([
      { type: "table" },
      { type: "section" },
      { type: "table" },
      { type: "table" },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("3");
    expect(errors[0]).toContain("0, 2, 3");
  });

  it("accepts an empty array", () => {
    expect(checkSingleTableBlock([])).toEqual([]);
  });
});
