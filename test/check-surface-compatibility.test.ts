import { checkSurfaceCompatibility, type Surface } from "../src/helpers/check-surface-compatibility";

const SURFACES: readonly Surface[] = ["message", "modal", "home"];

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

  it("rejects non-modal blocks (file, markdown, plan, table, task_card, context_actions, data_visualization, container) on modal", () => {
    const blocks = [
      { type: "file" },
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
      { type: "data_visualization" },
      { type: "container" },
    ];
    expect(checkSurfaceCompatibility(blocks, "modal")).toHaveLength(8);
  });

  it("rejects non-home blocks on home", () => {
    const blocks = [
      { type: "file" },
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
    ];
    expect(checkSurfaceCompatibility(blocks, "home")).toHaveLength(6);
  });

  it("allows container and data_visualization on messages and home but not modal (per docs)", () => {
    // container-block / data-visualization-block reference pages list
    // "Available in surfaces: Messages, Home tabs".
    const blocks = [{ type: "container" }, { type: "data_visualization" }];
    expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
    expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([
      "blocks[0].type 'container' is not allowed on surface 'modal'",
      "blocks[1].type 'data_visualization' is not allowed on surface 'modal'",
    ]);
  });

  it("allows message-specific blocks (markdown, plan, table, task_card, context_actions, data_visualization, container) on messages", () => {
    const blocks = [
      { type: "markdown" },
      { type: "plan" },
      { type: "table" },
      { type: "task_card" },
      { type: "context_actions" },
      { type: "data_visualization" },
      { type: "container" },
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

  it("allows data_table on messages but not modal or home", () => {
    // blocks.json lists data_table as Messages + Home tabs, but as a
    // table-family block it inherits table's messages-only render behavior.
    expect(checkSurfaceCompatibility([{ type: "data_table" }], "message")).toEqual([]);
    expect(checkSurfaceCompatibility([{ type: "data_table" }], "modal")).toHaveLength(1);
    expect(checkSurfaceCompatibility([{ type: "data_table" }], "home")).toHaveLength(1);
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

  describe("element surface rules", () => {
    // Per each element's reference page (`available_in_surfaces` frontmatter)
    // under https://docs.slack.dev/reference/block-kit/block-elements.
    const expectedError = (path: string, type: string, allowed: readonly Surface[], surface: Surface) =>
      `${path}.type '${type}' is only allowed in ${allowed.join(" and ")} surfaces (got '${surface}')`;

    const inputHosted: [string, readonly Surface[]][] = [
      ["file_input", ["modal"]],
      ["email_text_input", ["modal"]],
      ["number_input", ["modal"]],
      ["url_text_input", ["modal"]],
      ["rich_text_input", ["modal", "home"]],
      ["datetimepicker", ["message", "modal"]],
      ["plain_text_input", ["message", "modal", "home"]],
    ];

    describe.each(inputHosted)("%s in input.element", (type, allowed) => {
      it.each(SURFACES)("on %s", (surface) => {
        const errors = checkSurfaceCompatibility([{ type: "input", element: { type } }], surface);
        expect(errors).toEqual(
          allowed.includes(surface) ? [] : [expectedError("blocks[0].element", type, allowed, surface)],
        );
      });
    });

    const actionsHosted: [string, readonly Surface[]][] = [
      ["workflow_button", ["message"]],
      ["datetimepicker", ["message", "modal"]],
      ["button", ["message", "modal", "home"]],
    ];

    describe.each(actionsHosted)("%s in actions.elements", (type, allowed) => {
      it.each(SURFACES)("on %s", (surface) => {
        const errors = checkSurfaceCompatibility(
          [{ type: "actions", elements: [{ type: "button" }, { type }] }],
          surface,
        );
        expect(errors).toEqual(
          allowed.includes(surface) ? [] : [expectedError("blocks[0].elements[1]", type, allowed, surface)],
        );
      });
    });

    it.each(SURFACES)("checks workflow_button as a section accessory on %s", (surface) => {
      const errors = checkSurfaceCompatibility([{ type: "section", accessory: { type: "workflow_button" } }], surface);
      expect(errors).toEqual(
        surface === "message" ? [] : [expectedError("blocks[0].accessory", "workflow_button", ["message"], surface)],
      );
    });

    it("keeps the historical file_input message text", () => {
      expect(checkSurfaceCompatibility([{ type: "input", element: { type: "file_input" } }], "home")).toEqual([
        "blocks[0].element.type 'file_input' is only allowed in modal surfaces (got 'home')",
      ]);
    });

    it("allows feedback_buttons and icon_button inside context_actions on messages", () => {
      const blocks = [{ type: "context_actions", elements: [{ type: "feedback_buttons" }, { type: "icon_button" }] }];
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    });

    it("reports only the block error when context_actions itself is forbidden", () => {
      const blocks = [{ type: "context_actions", elements: [{ type: "feedback_buttons" }, { type: "icon_button" }] }];
      expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([
        "blocks[0].type 'context_actions' is not allowed on surface 'modal'",
      ]);
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([
        "blocks[0].type 'context_actions' is not allowed on surface 'home'",
      ]);
    });

    it("ignores elements in locations that aren't element hosts", () => {
      // `element` on a non-input block, `elements` on a context block, etc.
      const blocks = [
        { type: "section", element: { type: "file_input" } },
        { type: "context", elements: [{ type: "workflow_button" }] },
      ];
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
    });
  });

  describe("nested blocks", () => {
    const container = (...child_blocks: unknown[]) => ({ type: "container", child_blocks });

    it("allows surface-compatible children on every surface where container is allowed", () => {
      const blocks = [
        container({ type: "section" }, { type: "divider" }, { type: "input", element: { type: "plain_text_input" } }),
      ];
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
    });

    it("applies block bans to container.child_blocks", () => {
      const blocks = [{ type: "divider" }, container({ type: "section" }, { type: "table" })];
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([
        "blocks[1].child_blocks[1].type 'table' is not allowed on surface 'home'",
      ]);
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
    });

    it("rejects a nested file block on messages", () => {
      expect(checkSurfaceCompatibility([container({ type: "file" })], "message")).toEqual([
        "blocks[0].child_blocks[0].type 'file' is not allowed on surface 'message'",
      ]);
    });

    it("applies element rules inside container.child_blocks", () => {
      const blocks = [
        container(
          { type: "input", element: { type: "email_text_input" } },
          { type: "actions", elements: [{ type: "workflow_button" }] },
          { type: "section", accessory: { type: "workflow_button" } },
        ),
      ];
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([
        "blocks[0].child_blocks[0].element.type 'email_text_input' is only allowed in modal surfaces (got 'message')",
      ]);
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([
        "blocks[0].child_blocks[0].element.type 'email_text_input' is only allowed in modal surfaces (got 'home')",
        "blocks[0].child_blocks[1].elements[0].type 'workflow_button' is only allowed in message surfaces (got 'home')",
        "blocks[0].child_blocks[2].accessory.type 'workflow_button' is only allowed in message surfaces (got 'home')",
      ]);
    });

    it("reports only the container error on modal, not its children", () => {
      const blocks = [container({ type: "table" }, { type: "input", element: { type: "workflow_button" } })];
      expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([
        "blocks[0].type 'container' is not allowed on surface 'modal'",
      ]);
    });

    it("walks carousel.elements as nested card blocks", () => {
      const blocks = [{ type: "carousel", elements: [{ type: "card" }, { type: "card" }] }];
      expect(checkSurfaceCompatibility(blocks, "message")).toEqual([]);
      expect(checkSurfaceCompatibility(blocks, "home")).toEqual([]);
      expect(checkSurfaceCompatibility(blocks, "modal")).toEqual([
        "blocks[0].type 'carousel' is not allowed on surface 'modal'",
      ]);
    });

    it("tolerates null, non-object, and untyped children", () => {
      const blocks = [null, container(null, 5, "x", { type: 3 }, {}), { type: "actions", elements: [null, 1] }];
      for (const surface of SURFACES) {
        expect(checkSurfaceCompatibility(blocks, surface)).toEqual(
          surface === "modal" ? ["blocks[1].type 'container' is not allowed on surface 'modal'"] : [],
        );
      }
    });

    it("stops descending past the depth cap instead of overflowing the stack", () => {
      // Real Slack payloads never nest containers; this is a guard for
      // callers invoking the helper directly on unvalidated input.
      let deep: unknown = { type: "table" };
      for (let i = 0; i < 10_000; i++) {
        deep = container(deep);
      }
      expect(() => checkSurfaceCompatibility([deep], "home")).not.toThrow();
      expect(checkSurfaceCompatibility([deep], "home")).toEqual([]);
    });
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
