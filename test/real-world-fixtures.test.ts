import { validateBlockKit } from "../src/validate-block-kit";

/**
 * These fixtures are the kind of multi-block payloads apps send in practice.
 * They exercise several features at once (nested elements, accessories,
 * interactive components, surface compatibility, view envelopes) so a
 * regression anywhere in the schema surfaces here.
 */
describe("real-world fixtures", () => {
  it("welcome message with header + section + actions", () => {
    const result = validateBlockKit(
      [
        { type: "header", text: { type: "plain_text", text: "Welcome!" } },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hi <@U123ABC>, thanks for joining. What would you like to do next?",
          },
        },
        { type: "divider" },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Start onboarding" },
              style: "primary",
              action_id: "start_onboarding",
              value: "start",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Take a tour" },
              action_id: "take_tour",
              url: "https://example.com/tour",
            },
          ],
        },
      ],
      { surface: "message" },
    );
    expect(result.valid).toBe(true);
  });

  it("settings modal with input blocks and select menus", () => {
    const result = validateBlockKit(
      {
        type: "modal",
        title: { type: "plain_text", text: "Settings" },
        submit: { type: "plain_text", text: "Save" },
        close: { type: "plain_text", text: "Cancel" },
        callback_id: "settings_modal",
        private_metadata: JSON.stringify({ user: "U123" }),
        blocks: [
          {
            type: "input",
            block_id: "name",
            label: { type: "plain_text", text: "Display name" },
            element: {
              type: "plain_text_input",
              action_id: "name_input",
              min_length: 1,
              max_length: 50,
            },
          },
          {
            type: "input",
            block_id: "channel",
            label: { type: "plain_text", text: "Default channel" },
            element: {
              type: "channels_select",
              action_id: "channel_pick",
              placeholder: { type: "plain_text", text: "Choose a channel" },
            },
          },
          {
            type: "input",
            block_id: "notify",
            label: { type: "plain_text", text: "Notifications" },
            element: {
              type: "checkboxes",
              action_id: "notify_opts",
              options: [
                {
                  text: { type: "mrkdwn", text: "*Replies* to my messages" },
                  value: "replies",
                },
                {
                  text: { type: "mrkdwn", text: "*Mentions* of me" },
                  value: "mentions",
                },
              ],
            },
          },
          {
            type: "input",
            block_id: "daily_time",
            label: { type: "plain_text", text: "Daily digest time" },
            element: {
              type: "timepicker",
              action_id: "digest_time",
              initial_time: "09:00",
            },
            optional: true,
          },
        ],
      },
      { target: "modal" },
    );
    expect(result.valid).toBe(true);
  });

  it("home tab with rich_text + carousel of cards", () => {
    const result = validateBlockKit(
      {
        type: "home",
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "Your dashboard" },
          },
          {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: "Hey ", style: { bold: true } },
                  { type: "user", user_id: "U123ABC" },
                  { type: "text", text: ", here’s what’s new " },
                  { type: "emoji", name: "wave", skin_tone: 2 },
                ],
              },
              {
                type: "rich_text_list",
                style: "bullet",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [{ type: "text", text: "3 new replies" }],
                  },
                  {
                    type: "rich_text_section",
                    elements: [{ type: "text", text: "1 pending approval" }],
                  },
                ],
              },
            ],
          },
          {
            type: "carousel",
            elements: [
              {
                type: "card",
                title: { type: "plain_text", text: "Approvals" },
                body: { type: "mrkdwn", text: "1 pending" },
                actions: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "Review" },
                    action_id: "review",
                  },
                ],
              },
              {
                type: "card",
                title: { type: "plain_text", text: "Mentions" },
                body: { type: "mrkdwn", text: "5 in last 24h" },
              },
            ],
          },
        ],
      },
      { target: "home" },
    );
    expect(result.valid).toBe(true);
  });

  it("message with a table + surrounding context", () => {
    const result = validateBlockKit(
      [
        { type: "header", text: { type: "plain_text", text: "Report" } },
        {
          type: "table",
          rows: [
            [
              { type: "raw_text", text: "Name" },
              { type: "raw_text", text: "Status" },
            ],
            [
              {
                type: "rich_text",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [{ type: "text", text: "Alice" }],
                  },
                ],
              },
              { type: "raw_text", text: "Active" },
            ],
          ],
          column_settings: [{ align: "left" }, { align: "center", is_wrapped: true }],
        },
      ],
      { surface: "message" },
    );
    expect(result.valid).toBe(true);
  });

  it("rejects a message with two tables (server-side rule via helper)", () => {
    const result = validateBlockKit([
      {
        type: "table",
        rows: [[{ type: "raw_text", text: "a" }]],
      },
      {
        type: "table",
        rows: [[{ type: "raw_text", text: "b" }]],
      },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("only one 'table' block"))).toBe(true);
  });

  it("rejects a modal that attempts a table or file block", () => {
    for (const block of [
      { type: "table", rows: [[{ type: "raw_text", text: "a" }]] },
      { type: "file", external_id: "F1", source: "remote" },
    ]) {
      const result = validateBlockKit(
        {
          type: "modal",
          title: { type: "plain_text", text: "M" },
          blocks: [block],
        },
        { target: "modal" },
      );
      expect(result.valid).toBe(false);
    }
  });

  it("aggregates multiple errors from different validators in one call", () => {
    const result = validateBlockKit([
      // duplicate block_id
      { type: "divider", block_id: "x" },
      { type: "divider", block_id: "x" },
      // cumulative markdown > 12k
      { type: "markdown", text: "a".repeat(7000) },
      { type: "markdown", text: "b".repeat(6000) },
      // multiple focus_on_load: true inside input elements
      {
        type: "input",
        label: { type: "plain_text", text: "A" },
        element: {
          type: "plain_text_input",
          action_id: "a",
          focus_on_load: true,
        },
      },
      {
        type: "input",
        label: { type: "plain_text", text: "B" },
        element: {
          type: "plain_text_input",
          action_id: "b",
          focus_on_load: true,
        },
      },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be unique"))).toBe(true);
    expect(result.errors.some((e) => e.includes("cumulative markdown"))).toBe(true);
    expect(result.errors.some((e) => e.includes("'focus_on_load: true'"))).toBe(true);
  });

  it("accepts a task_card embedded in a plan_block", () => {
    const result = validateBlockKit([
      {
        type: "plan",
        title: "Onboarding plan",
        tasks: [
          {
            task_id: "t1",
            title: "Connect GitHub",
            status: "complete",
            details: {
              type: "rich_text",
              elements: [
                {
                  type: "rich_text_section",
                  elements: [{ type: "text", text: "Done ✓" }],
                },
              ],
            },
          },
          {
            task_id: "t2",
            title: "Invite teammates",
            status: "in_progress",
          },
        ],
      },
    ]);
    expect(result.valid).toBe(true);
  });
});
