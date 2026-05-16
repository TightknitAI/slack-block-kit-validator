import { Bench } from "tinybench";
import { validateBlockKit } from "../src/validate-block-kit.js";
import { findDuplicateBlockIds } from "../src/helpers/find-duplicate-block-ids.js";
import { checkFocusOnLoadUniqueness } from "../src/helpers/check-focus-on-load-uniqueness.js";
import { checkSurfaceCompatibility } from "../src/helpers/check-surface-compatibility.js";

const buildSimpleBlocks = (n: number): unknown[] =>
  Array.from({ length: n }, (_, i) => ({
    type: "section",
    block_id: `b${i}`,
    text: { type: "mrkdwn", text: `Block ${i} — hello *world*` },
  }));

const buildMixedBlocks = (n: number): unknown[] =>
  Array.from({ length: n }, (_, i) => {
    const kind = i % 5;
    if (kind === 0) return { type: "divider", block_id: `b${i}` };
    if (kind === 1)
      return {
        type: "section",
        block_id: `b${i}`,
        text: { type: "mrkdwn", text: `Block ${i} — hello *world*` },
      };
    if (kind === 2)
      return {
        type: "header",
        block_id: `b${i}`,
        text: { type: "plain_text", text: `Section ${i}` },
      };
    if (kind === 3)
      return {
        type: "actions",
        block_id: `b${i}`,
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Go" },
            action_id: `a${i}`,
            value: String(i),
          },
        ],
      };
    return {
      type: "context",
      block_id: `b${i}`,
      elements: [{ type: "mrkdwn", text: `Footer ${i}` }],
    };
  });

const SMALL = buildSimpleBlocks(5);
const TYPICAL = buildMixedBlocks(20);
const LARGE = buildMixedBlocks(50);

const INVALID = [
  { type: "section" },
  { type: "header", text: { type: "plain_text", text: "x".repeat(200) } },
];

const main = async (): Promise<void> => {
  const bench = new Bench({ time: 500 });

  bench
    .add("validateBlockKit / 5-block valid", () => {
      validateBlockKit(SMALL);
    })
    .add("validateBlockKit / 20-block valid", () => {
      validateBlockKit(TYPICAL);
    })
    .add("validateBlockKit / 50-block valid", () => {
      validateBlockKit(LARGE);
    })
    .add("validateBlockKit / 2-block invalid (error formatting)", () => {
      validateBlockKit(INVALID);
    })
    .add("findDuplicateBlockIds / 50 blocks", () => {
      findDuplicateBlockIds(LARGE as never);
    })
    .add("checkFocusOnLoadUniqueness / 50 blocks", () => {
      checkFocusOnLoadUniqueness(LARGE);
    })
    .add("checkSurfaceCompatibility / 50 blocks on message", () => {
      checkSurfaceCompatibility(LARGE as never, "message");
    });

  await bench.run();

  console.log("\nresults (ops/sec, higher is better):");
  console.table(
    bench.tasks.map(({ name, result }) => {
      // tinybench's result type is a union that includes an aborted variant
      // missing latency/throughput. Narrow on `state` before reading them.
      if (result?.state !== "completed") {
        return { task: name, "ops/sec": "—", "avg µs/op": "—", samples: 0 };
      }
      return {
        task: name,
        "ops/sec": result.throughput.mean.toFixed(0),
        "avg µs/op": (result.latency.mean * 1000).toFixed(2),
        samples: result.latency.samplesCount,
      };
    }),
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
