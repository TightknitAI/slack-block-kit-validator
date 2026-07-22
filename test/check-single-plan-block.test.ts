import { checkSinglePlanBlock } from "../src/helpers/check-single-plan-block";

describe("checkSinglePlanBlock", () => {
  it("returns no errors when there are no plan blocks", () => {
    expect(checkSinglePlanBlock([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("returns no errors when there is exactly one plan block", () => {
    expect(checkSinglePlanBlock([{ type: "section" }, { type: "plan" }])).toEqual([]);
  });

  it("flags multiple plan blocks with their indices", () => {
    const errors = checkSinglePlanBlock([{ type: "plan" }, { type: "section" }, { type: "plan" }, { type: "plan" }]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("3");
    expect(errors[0]).toContain("0, 2, 3");
  });

  it("accepts an empty array", () => {
    expect(checkSinglePlanBlock([])).toEqual([]);
  });
});
