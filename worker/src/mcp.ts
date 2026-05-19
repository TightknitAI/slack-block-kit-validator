import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { validateBlockKit } from "@tightknitai/slack-block-kit-validator";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import type { Env } from "./types.js";

const MCP_SERVER_DESCRIPTION =
  "Slack Block Kit validator hosted by Tightknit (https://tightknit.ai). " +
  "Validates Block Kit JSON against the full schema plus Slack's documented " +
  "cross-payload rules (duplicate block_ids, cumulative markdown length, " +
  "surface compatibility, focus_on_load uniqueness, table-block limits, etc.). " +
  "Powered by @tightknitai/slack-block-kit-validator on npm.";

const VALIDATE_TOOL_DESCRIPTION =
  "Validate a Slack Block Kit payload. Returns { valid, errors[] } — `errors` " +
  "is a flat array of human-readable messages. Pass `target: 'modal'` or " +
  "`'home'` when validating a view envelope; pass `surface` to enforce " +
  "surface-compatibility against bare blocks. Slack returns 200 OK for invalid " +
  "Block Kit (silently dropping the message metadata), so always validate " +
  "before sending.";

export class BlockKitMcp extends McpAgent<Env> {
  server = new McpServer({
    name: "Slack Block Kit Validator (Tightknit)",
    version: "0.1.0",
    description: MCP_SERVER_DESCRIPTION,
  });

  async init(): Promise<void> {
    this.server.registerTool(
      "validate_block_kit",
      {
        description: VALIDATE_TOOL_DESCRIPTION,
        inputSchema: {
          input: z
            .unknown()
            .describe(
              "The Block Kit payload to validate. An array of blocks when target=blocks; a view envelope object when target=modal or home.",
            ),
          target: z
            .enum(["blocks", "modal", "home"])
            .optional()
            .describe("Which top-level shape to validate. Defaults to 'blocks'."),
          surface: z
            .enum(["message", "modal", "home"])
            .optional()
            .describe(
              "Slack surface the payload will render on. Only meaningful when target='blocks'; modal/home derive surface automatically.",
            ),
        },
      },
      async ({ input, target, surface }) => {
        const result = validateBlockKit(input, { target, surface });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      },
    );
  }
}
