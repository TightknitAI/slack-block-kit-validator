// Cloudflare Workers smoke entrypoint. Imported by the workers-build CI job
// through esbuild in worker mode — if any Node-only API or unbundled
// require() sneaks into one of the entry points, the bundle build fails.
// We exercise both the standalone validator (recommended for Workers) and
// the helpers entry, since neither should pull in Node-specific APIs.

import { findDuplicateBlockIds } from "../src/helpers.js";
import { validateBlocks } from "../dist/standalone-validator.js";

export default {
  fetch(): Response {
    const blocks = [
      { type: "section", text: { type: "mrkdwn", text: "hi" }, block_id: "a" },
      { type: "divider", block_id: "a" },
    ];
    const valid = validateBlocks(blocks);
    const dups = findDuplicateBlockIds(blocks);
    return new Response(JSON.stringify({ valid, dups }), {
      headers: { "content-type": "application/json" },
    });
  },
};
