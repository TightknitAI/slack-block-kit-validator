// Loosely-typed views of the data_visualization shape. Helpers stay Ajv-free,
// so they accept the raw payload and guard each access defensively — anything
// structurally malformed is left for the JSON Schema to report.
interface DataPointLike {
  label?: unknown;
}
interface SeriesLike {
  name?: unknown;
  data?: unknown;
}
interface ChartLike {
  series?: unknown;
  axis_config?: { categories?: unknown } | null;
}
interface VizBlockLike {
  type?: string;
  chart?: ChartLike | null;
}

/**
 * Enforces the two `data_visualization` rules Slack applies at runtime that
 * JSON Schema can't express, because each depends on the values of sibling
 * fields:
 *
 *   1. **Unique series names** — every series in a chart must have a distinct
 *      `name`.
 *   2. **Label ↔ category matching** — each series must contain exactly one
 *      data point for every label in `axis_config.categories`, and no data
 *      point may use a label outside `categories`.
 *
 * Only cartesian (line/bar/area) charts have `series` + `axis_config`; pie
 * charts (segments only) carry no categories and are skipped. Structurally
 * malformed charts are skipped too — the schema reports those.
 *
 * @param blocks - array of Block Kit blocks
 * @returns array of error messages (empty when every chart is internally consistent)
 */
export function checkDataVisualizationConsistency(blocks: readonly { type?: string }[]): string[] {
  const errors: string[] = [];

  blocks.forEach((block, i) => {
    if (block?.type !== "data_visualization") {
      return;
    }
    const chart = (block as VizBlockLike).chart;
    const series = chart?.series;
    if (!Array.isArray(series)) {
      // Pie chart or malformed cartesian — nothing to cross-check here.
      return;
    }

    // 1. Series names must be unique within the chart.
    const seenNames = new Set<string>();
    series.forEach((entry) => {
      const name = (entry as SeriesLike)?.name;
      if (typeof name !== "string") {
        return;
      }
      if (seenNames.has(name)) {
        errors.push(
          `blocks[${i}].chart.series has a duplicate series name '${name}' — series names must be unique within a chart`,
        );
      }
      seenNames.add(name);
    });

    // 2. Every series' data points must line up exactly with the categories.
    const categories = chart?.axis_config?.categories;
    if (!Array.isArray(categories)) {
      return;
    }
    const categorySet = new Set(categories.filter((c): c is string => typeof c === "string"));

    series.forEach((entry, si) => {
      const data = (entry as SeriesLike)?.data;
      if (!Array.isArray(data)) {
        return;
      }
      // Count each label once. A single pass builds the per-label tally, so the
      // category coverage check below is a map lookup rather than a nested scan
      // over every data point.
      const labelCounts = new Map<string, number>();
      for (const d of data) {
        const label = (d as DataPointLike)?.label;
        if (typeof label !== "string") {
          continue;
        }
        labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
        if (!categorySet.has(label)) {
          errors.push(
            `blocks[${i}].chart.series[${si}] has a data point labeled '${label}' that is not in axis_config.categories`,
          );
        }
      }

      // Each category must be covered by exactly one data point.
      for (const category of categorySet) {
        const count = labelCounts.get(category) ?? 0;
        if (count === 0) {
          errors.push(`blocks[${i}].chart.series[${si}] is missing a data point for category '${category}'`);
        } else if (count > 1) {
          errors.push(
            `blocks[${i}].chart.series[${si}] has ${count} data points for category '${category}' — expected exactly one`,
          );
        }
      }
    });
  });

  return errors;
}
