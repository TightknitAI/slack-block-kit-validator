import { checkCumulativeMarkdownLength } from "../src/helpers/check-cumulative-markdown-length";

describe("checkCumulativeMarkdownLength", () => {
  it("returns no errors when under 12,000 cumulative chars", () => {
    expect(
      checkCumulativeMarkdownLength([
        { type: "markdown", text: "hello" },
        { type: "markdown", text: "world" },
      ]),
    ).toEqual([]);
  });

  it("ignores non-markdown blocks", () => {
    expect(
      checkCumulativeMarkdownLength([
        { type: "markdown", text: "x".repeat(5000) },
        { type: "section", text: "y".repeat(20000) },
      ]),
    ).toEqual([]);
  });

  it("flags when cumulative markdown exceeds 12,000 chars", () => {
    const errors = checkCumulativeMarkdownLength([
      { type: "markdown", text: "x".repeat(6000) },
      { type: "markdown", text: "y".repeat(6001) },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("12001 chars");
    expect(errors[0]).toContain("12000");
  });

  it("passes exactly at the 12,000 char boundary", () => {
    expect(checkCumulativeMarkdownLength([{ type: "markdown", text: "x".repeat(12_000) }])).toEqual([]);
  });

  it("accepts an empty array", () => {
    expect(checkCumulativeMarkdownLength([])).toEqual([]);
  });
});
