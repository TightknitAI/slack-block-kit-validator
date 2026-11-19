import { checkLayoutRules } from "../src/helpers/check-layout-rules";

const section = { type: "section" };
const layout = (...rows: unknown[][]) => ({ type: "layout", label: "L", rows: rows.map((items) => ({ items })) });
const container = (...child_blocks: unknown[]) => ({ type: "container", child_blocks });

describe("checkLayoutRules", () => {
  it("accepts layout > container > block", () => {
    expect(checkLayoutRules([layout([{ block: container(section) }])])).toEqual([]);
  });

  it("flags layout > container > layout", () => {
    expect(checkLayoutRules([layout([{ block: container(layout([{ block: section }])) }])])).toEqual([
      "blocks[0].rows[0].items[0].block.child_blocks[0]: layout and container blocks can nest at most 2 levels deep (this layout is level 3)",
    ]);
  });

  it("flags container > layout > container", () => {
    const errors = checkLayoutRules([container(layout([{ block: container(section) }]))]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("blocks[0].child_blocks[0].rows[0].items[0].block");
  });

  it("flags two large blocks sharing a row", () => {
    expect(checkLayoutRules([layout([{ block: { type: "carousel" } }, { block: { type: "data_table" } }])])).toEqual([
      "blocks[0].rows[0]: carousel, data_table and data_visualization blocks can't share a layout row (found carousel, data_table)",
    ]);
  });

  it("accepts large blocks in separate rows", () => {
    expect(checkLayoutRules([layout([{ block: { type: "carousel" } }], [{ block: { type: "data_table" } }])])).toEqual(
      [],
    );
  });

  it("requires a data_visualization item to take more than half of its row", () => {
    const viz = { type: "data_visualization" };
    expect(checkLayoutRules([layout([{ block: viz }])])).toEqual([]);
    expect(checkLayoutRules([layout([{ block: viz, width: "wide" }, { block: section }])])).toEqual([]);
    expect(checkLayoutRules([layout([{ block: viz }, { block: section }])])).toEqual([
      "blocks[0].rows[0].items[0]: a data_visualization block needs more than half of its layout row's width",
    ]);
  });

  it("ignores blocks that aren't layouts or containers", () => {
    expect(checkLayoutRules([section, { type: "divider" }])).toEqual([]);
  });
});
