import { checkSurfaceCompatibility, type Surface } from "../src/helpers/check-surface-compatibility";
import schema from "../src/slack-block-kit.schema.json";
import canonicalBlocks from "./fixtures/blocks.json";

/**
 * Drift guard for surface rules against Slack's canonical block data.
 *
 * `test/fixtures/blocks.json` is a verbatim snapshot of
 * https://docs.slack.dev/blocks.json — the JSON that powers the "Surfaces"
 * column on every block's reference page. Refresh it with:
 *
 *   curl -sSL https://docs.slack.dev/blocks.json -o test/fixtures/blocks.json
 *
 * When Slack ships a new block or changes a block's surfaces, refreshing the
 * snapshot makes this test fail until `check-surface-compatibility.ts` (and,
 * for a brand-new block, the schema) are updated to match — so the rules can't
 * silently diverge from canonical.
 */

// blocks.json entries carry a display `name` ("Data table"), not a machine
// type. Slack's type strings are the name lowercased with spaces → underscores.
const nameToType = (name: string): string => name.toLowerCase().replace(/ /g, "_");

const SURFACE_LABEL_TO_SURFACE: Record<string, Surface> = {
  Modals: "modal",
  Messages: "message",
  "Home tabs": "home",
};
const ALL_SURFACES: Surface[] = ["message", "modal", "home"];

interface CanonicalBlock {
  name: string;
  "available-in-surfaces": string[];
}
const blocks = canonicalBlocks as unknown as CanonicalBlock[];

// Blocks the validator intentionally forbids on a surface where blocks.json
// says they're allowed — canonical lists a surface the block doesn't actually
// render on. Kept in sync with the comment in check-surface-compatibility.ts.
// A `type:surface` here means "code is stricter than canonical, on purpose".
const KNOWN_DEVIATIONS = new Set(["card:modal", "file:message", "table:home", "data_table:home"]);

describe("surface rules vs canonical blocks.json", () => {
  it("snapshot looks sane", () => {
    expect(blocks.length).toBeGreaterThan(15);
    for (const b of blocks) {
      expect(Array.isArray(b["available-in-surfaces"])).toBe(true);
    }
  });

  it("every canonical block type is modeled in the schema", () => {
    const missing = blocks
      .map((b) => nameToType(b.name))
      .filter((type) => schema.$defs[`${type}_block` as keyof typeof schema.$defs] === undefined);
    expect(missing).toEqual([]);
  });

  it("code's forbidden-by-surface rules match canonical, except documented deviations", () => {
    const unexpected: string[] = [];
    const usedDeviations = new Set<string>();

    for (const block of blocks) {
      const type = nameToType(block.name);
      const canonicalSurfaces = new Set(block["available-in-surfaces"].map((label) => SURFACE_LABEL_TO_SURFACE[label]));

      for (const surface of ALL_SURFACES) {
        const canonicalAllows = canonicalSurfaces.has(surface);
        const codeAllows = checkSurfaceCompatibility([{ type }], surface).length === 0;
        if (canonicalAllows === codeAllows) {
          continue;
        }

        const key = `${type}:${surface}`;
        if (canonicalAllows && !codeAllows && KNOWN_DEVIATIONS.has(key)) {
          usedDeviations.add(key); // stricter than canonical, on purpose
          continue;
        }
        unexpected.push(
          `${key}: canonical ${canonicalAllows ? "allows" : "forbids"} but code ${codeAllows ? "allows" : "forbids"}`,
        );
      }
    }

    expect(unexpected).toEqual([]);
    // Every allowlisted deviation must still be real, or it's dead weight.
    expect([...KNOWN_DEVIATIONS].filter((k) => !usedDeviations.has(k))).toEqual([]);
  });
});
