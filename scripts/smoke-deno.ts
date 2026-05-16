// Deno-runnable smoke test for the published build.
// Confirms that the four entry points load and that a basic round-trip works
// inside Deno's runtime — useful when readers find the package via JSR-style
// imports or npm: specifiers.

import { validateBlockKit } from "../dist/index.js";
import { findDuplicateBlockIds } from "../dist/helpers.js";
import { slackBlockKitSchema } from "../dist/schema.js";
import { validateBlocks } from "../dist/standalone-validator.js";

const assert = (cond: boolean, msg: string): void => {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    // @ts-expect-error — `Deno` is provided by the Deno runtime
    Deno.exit(1);
  }
};

const ok = validateBlockKit([{ type: "section", text: { type: "mrkdwn", text: "hi" } }]);
assert(ok.valid, "valid blocks should pass");

const bad = validateBlockKit([{ type: "section" }]);
assert(!bad.valid, "invalid blocks should fail");
assert(bad.errors.length > 0, "invalid blocks should produce errors");

const dups = findDuplicateBlockIds([
  { type: "divider", block_id: "x" },
  { type: "divider", block_id: "x" },
]);
assert(dups.length === 1, "duplicate block_ids should be flagged");

assert(typeof slackBlockKitSchema === "object", "schema should be an object");
assert(validateBlocks([{ type: "divider" }]) === true, "standalone should accept a divider");

console.log("ok");
