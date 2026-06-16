import { checkSurfaceCompatibility } from "../src/helpers/check-surface-compatibility";

/**
 * Surface matrix source of truth: https://docs.slack.dev/blocks.json — the
 * canonical JSON powering the "Surfaces" column on docs pages.
 */
describe("checkSurfaceCompatibility", () => {
  it("allows section/divider/header/image/actions/rich_text/video on all surfaces", () => {
    const blocks = [
      { type: "section" },
      { type: "divider" },
      { type: "header" },
      { type: "image" },
      { type: "actions" },
      { type: "rich_text" },
      { type: "video" },
    ];
    expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([]);
    expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
  });

  it("allows input blocks on messages (per canonical blocks.json)", () => {
    expect(checkSurfaceCompatibility([{ type: "input", element: { type: "plain_text_input" } }], "message")).toEqual(
      [],
    );
  });

  it("allows input blocks on modal and home", () => {
    const block = [{ type: "input", element: { type: "plain_text_input" } }];
    expect(checkSurfaceCompatibility(block, "modal")).toEqual([]);
    expect(checkSurfaceCompatibility(block, "home")).toEqual([]);
  });

  it("rejects alert blocks on messages and home (modal-only per docs)", () => {
    expect(checkSurfaceCompatibility([{ type: "alert" }], "message")).toHaveLength(1);
    expect(checkSurfaceCompatibility([{ type: "alert" }], "home")).toHaveLength(1);
    expect(checkSurfaceCompatibility([{ type: "alert" }], "modal")).toEqual([]);
  });

  it("rejects non-modal blocks (file, markdown, plan, table, task_card, context_actions, data_visualization) on modal", () => {
    const blocks = [
      { type: "file" },
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
      { type: "data_visualization" },
    ];
    expect(checkSurfaceCompatibility(blocks, "modal")).toHaveLength(7);
  });

  it("rejects non-home blocks on home", () => {
    const blocks = [
      { type: "file" },
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
      { type: "data_visualization" },
    ];
    expect(checkSurfaceCompatibility(blocks, "home")).toHaveLength(7);
  });

  it("allows message-specific blocks (markdown, plan, table, task_card, context_actions, data_visualization) on messages", () => {
    const blocks = [
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
      { type: "data_visualization" },
    ];
    expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
  });

  it("rejects file blocks on every surface — file blocks are never outbound", () => {
    // Per https://docs.slack.dev/reference/block-kit/blocks/file-block,
    // file blocks are only produced by Slack when retrieving messages that
    // contain remote files; they cannot be sent outbound by an app.
    const blocks = [{ type: "file" }];
    expect(checkSurfaceCompatibility(blocks, "message")).toHaveLength(1);
    expect(checkSurfaceCompatibility(blocks, "modal")).toHaveLength(1);
    expect(checkSurfaceCompatibility(blocks, "home")).toHaveLength(1);
  });

  it("rejects carousel and card on modal surfaces (they fail to render in modals empirically)", () => {
    // blocks.json lists carousel/card as modal-available, but they do not
    // actually render inside modal views. Messages and Home tabs are fine.
    const blocks = [{ type: "carousel" }, { type: "card" }];
    expect(checkSurfaceCompatibility(blocks, "modal")).toHaveLength(2);
    expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
  });

  it("rejects file_input on non-modal surfaces", () => {
    const errors = checkSurfaceCompatibility([{ type: "input", element: { type: "file_input" } }], "home");
    expect(errors.some((e) => e.includes("'file_input'"))).toBe(true);
  });

  it("allows file_input on modal surface", () => {
    expect(checkSurfaceCompatibility([{ type: "input", element: { type: "file_input" } }], "modal")).toEqual([]);
  });

  it("reports only one error when an input+file_input block is itself already forbidden on the surface", () => {
    // On a surface where `input` IS allowed (message), the element-level
    // check still needs to fire for file_input.
    const errors = checkSurfaceCompatibility([{ type: "input", element: { type: "file_input" } }], "message");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("file_input");
  });

  describe("per-surface block-count caps", () => {
    // https://docs.slack.dev/reference/block-kit/blocks: "You can include up
    // to 50 blocks in each message, and 100 blocks in modals or Home tabs."
    const divider = { type: "divider" };

    it("accepts exactly 50 blocks on a message surface", () => {
      const blocks = Array.from({ length: 50 }, () => divider);
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    });

    it("flags messages with 51+ blocks", () => {
      const blocks = Array.from({ length: 51 }, () => divider);
      const errors = checkSurfaceCompatibility(blocks, "message");
      expect(errors).toEqual(["surface 'message' allows at most 50 blocks (got 51)"]);
    });

    it("accepts 51–100 blocks on modal and home surfaces", () => {
      const blocks = Array.from({ length: 80 }, () => divider);
      expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([]);
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
    });
  });
});
