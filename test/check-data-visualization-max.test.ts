import { checkDataVisualizationMax, DATA_VISUALIZATION_MAX } from "../src/helpers/check-data-visualization-max";

const viz = { type: "data_visualization" };

describe("checkDataVisualizationMax", () => {
  it("returns no errors when there are no data_visualization blocks", () => {
    expect(checkDataVisualizationMax([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("returns no errors for a single data_visualization block", () => {
    expect(checkDataVisualizationMax([{ type: "section" }, viz])).toEqual([]);
  });

  it(`accepts exactly ${DATA_VISUALIZATION_MAX} data_visualization blocks`, () => {
    expect(checkDataVisualizationMax([viz, viz])).toEqual([]);
  });

  it(`flags more than ${DATA_VISUALIZATION_MAX} data_visualization blocks with their indices`, () => {
    const errors = checkDataVisualizationMax([viz, { type: "section" }, viz, viz]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("3");
    expect(errors[0]).toContain("0, 2, 3");
  });

  it("accepts an empty array", () => {
    expect(checkDataVisualizationMax([])).toEqual([]);
  });
});
