import { checkDataVisualizationConsistency } from "../src/helpers/check-data-visualization-consistency";

const viz = (chart: unknown) => ({ type: "data_visualization", title: "T", chart });

const cartesian = (series: unknown, categories: string[] = ["Mon", "Tue"]) => ({
  type: "line",
  series,
  axis_config: { categories },
});

describe("checkDataVisualizationConsistency", () => {
  it("returns no errors when there are no data_visualization blocks", () => {
    expect(checkDataVisualizationConsistency([{ type: "section" }, { type: "divider" }])).toEqual([]);
  });

  it("accepts a chart whose series cover the categories exactly", () => {
    const block = viz(
      cartesian([
        {
          name: "Desktop",
          data: [
            { label: "Mon", value: 1 },
            { label: "Tue", value: 2 },
          ],
        },
        {
          name: "Mobile",
          data: [
            { label: "Mon", value: 3 },
            { label: "Tue", value: 4 },
          ],
        },
      ]),
    );
    expect(checkDataVisualizationConsistency([block])).toEqual([]);
  });

  it("skips pie charts (no series / categories to cross-check)", () => {
    const pie = viz({
      type: "pie",
      segments: [
        { label: "A", value: 1 },
        { label: "A", value: 2 },
      ],
    });
    expect(checkDataVisualizationConsistency([pie])).toEqual([]);
  });

  it("flags duplicate series names", () => {
    const block = viz(
      cartesian([
        {
          name: "Dupe",
          data: [
            { label: "Mon", value: 1 },
            { label: "Tue", value: 2 },
          ],
        },
        {
          name: "Dupe",
          data: [
            { label: "Mon", value: 3 },
            { label: "Tue", value: 4 },
          ],
        },
      ]),
    );
    const errors = checkDataVisualizationConsistency([block]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("duplicate series name 'Dupe'");
  });

  it("checks series-name uniqueness even without axis_config", () => {
    const block = viz({
      type: "line",
      series: [
        { name: "X", data: [{ label: "Mon", value: 1 }] },
        { name: "X", data: [{ label: "Mon", value: 2 }] },
      ],
    });
    const errors = checkDataVisualizationConsistency([block]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("'X'");
  });

  it("flags a data point label that is not a declared category", () => {
    const block = viz(
      cartesian([
        {
          name: "S",
          data: [
            { label: "Mon", value: 1 },
            { label: "Tue", value: 2 },
            { label: "Wed", value: 3 },
          ],
        },
      ]),
    );
    const errors = checkDataVisualizationConsistency([block]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("'Wed'");
    expect(errors[0]).toContain("not in axis_config.categories");
  });

  it("flags a series that is missing a data point for a category", () => {
    const block = viz(cartesian([{ name: "S", data: [{ label: "Mon", value: 1 }] }], ["Mon", "Tue", "Wed"]));
    const errors = checkDataVisualizationConsistency([block]);
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining("missing a data point for category 'Tue'")]),
    );
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining("missing a data point for category 'Wed'")]),
    );
  });

  it("flags a category covered by more than one data point", () => {
    const block = viz(
      cartesian([
        {
          name: "S",
          data: [
            { label: "Mon", value: 1 },
            { label: "Mon", value: 2 },
            { label: "Tue", value: 3 },
          ],
        },
      ]),
    );
    const errors = checkDataVisualizationConsistency([block]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("2 data points for category 'Mon'");
  });

  it("reports the offending block index", () => {
    const good = viz(
      cartesian([
        {
          name: "S",
          data: [
            { label: "Mon", value: 1 },
            { label: "Tue", value: 2 },
          ],
        },
      ]),
    );
    const bad = viz(cartesian([{ name: "S", data: [{ label: "Mon", value: 1 }] }]));
    const errors = checkDataVisualizationConsistency([{ type: "divider" }, good, bad]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("blocks[2]");
  });

  it("skips structurally malformed charts (left to the schema)", () => {
    expect(checkDataVisualizationConsistency([{ type: "data_visualization" }])).toEqual([]);
    expect(checkDataVisualizationConsistency([viz({ type: "line", series: "nope" })])).toEqual([]);
  });

  it("accepts an empty array", () => {
    expect(checkDataVisualizationConsistency([])).toEqual([]);
  });

  it("stays linear in categories × labels", () => {
    // Regression guard: counting each category with `labels.filter(...)`
    // rescans every label per category, so this chart costs seconds of CPU
    // (O(C × L)) where the single-pass count costs tens of milliseconds
    // (O(C + L)). The helper is exported on its own, so nothing upstream
    // bounds C or L here. The budget sits well clear of both.
    const N = 30_000;
    const labels = Array.from({ length: N }, (_, i) => `cat-${i}`);
    const block = viz(cartesian([{ name: "S", data: labels.map((label, value) => ({ label, value })) }], labels));

    const started = performance.now();
    const errors = checkDataVisualizationConsistency([block]);
    const elapsed = performance.now() - started;

    expect(errors).toEqual([]);
    expect(elapsed).toBeLessThan(1000);
  });

  it("caps the mismatches reported for one series and counts the rest", () => {
    // Every category is uncovered, so the pre-cap helper emitted one string
    // per category — 25,000 of them from a single series.
    const categories = Array.from({ length: 25_000 }, (_, i) => `c${i}`);
    const block = viz(cartesian([{ name: "S", data: [{ label: "c0", value: 1 }] }], categories));

    const errors = checkDataVisualizationConsistency([block]);

    expect(errors).toHaveLength(101); // 100 listed + one summary
    expect(errors.at(-1)).toBe(
      "blocks[0].chart.series[0] has 24899 further data point/category mismatches — only the first 100 are listed",
    );
  });

  it("reports every mismatch when a series stays under the cap", () => {
    const categories = Array.from({ length: 100 }, (_, i) => `c${i}`);
    const block = viz(cartesian([{ name: "S", data: [{ label: "c0", value: 1 }] }], categories));

    const errors = checkDataVisualizationConsistency([block]);

    expect(errors).toHaveLength(99); // c1..c99 uncovered, nothing suppressed
    expect(errors.some((e) => e.includes("further data point/category mismatches"))).toBe(false);
  });
});
