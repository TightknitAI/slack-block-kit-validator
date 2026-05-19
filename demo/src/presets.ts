import type { Surface } from "@tightknitai/slack-block-kit-validator";

export interface Preset {
  id: string;
  label: string;
  /** Surface this preset belongs to. Drives which tab it shows under. */
  surface: Surface;
  /** Short description shown under the preset row. */
  blurb: string;
  /** Hint for chip styling — invalid presets render in red. */
  tone: "valid" | "invalid";
  json: string;
}

const stringify = (value: unknown): string => JSON.stringify(value, null, 2);

// ---------- Message presets ----------

const dailyStandup = stringify([
  {
    type: "header",
    text: { type: "plain_text", text: "Daily standup — Engineering" },
  },
  {
    type: "context",
    elements: [
      {
        type: "image",
        image_url: "https://api.slack.com/img/blocks/bkb_template_images/profile_1.png",
        alt_text: "calendar",
      },
      { type: "mrkdwn", text: "*Thursday, May 14* · 12 attendees" },
    ],
  },
  { type: "divider" },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":green_check: *Yesterday*\n• Shipped Block Kit validator v0.1\n• Reviewed two PRs in `tightknit/api`\n• Cleared inbox triage",
    },
    accessory: {
      type: "image",
      image_url: "https://api.slack.com/img/blocks/bkb_template_images/profile_2.png",
      alt_text: "avatar",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":hourglass_flowing_sand: *Today*\n• Build the live demo for the validator\n• Pair with @ana on the retries patch\n• Eng sync at 3pm",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":warning: *Blockers*\n_Staging cluster is still rolling — waiting on the platform team before I can repro the bug._",
    },
  },
  { type: "divider" },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Mark as posted" },
        style: "primary",
        action_id: "standup_done",
        value: "done",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Edit draft" },
        action_id: "standup_edit",
        value: "edit",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Skip today" },
        style: "danger",
        action_id: "standup_skip",
        value: "skip",
        confirm: {
          title: { type: "plain_text", text: "Skip standup?" },
          text: {
            type: "mrkdwn",
            text: "Your teammates won't see an update from you today.",
          },
          confirm: { type: "plain_text", text: "Skip" },
          deny: { type: "plain_text", text: "Cancel" },
        },
      },
    ],
  },
]);

const incidentAlert = stringify([
  {
    type: "header",
    text: { type: "plain_text", text: ":rotating_light: INC-2049 · Checkout 5xx spike" },
  },
  {
    type: "section",
    fields: [
      { type: "mrkdwn", text: "*Severity*\n`SEV-2`" },
      { type: "mrkdwn", text: "*Status*\n`Investigating`" },
      { type: "mrkdwn", text: "*Service*\n`payments-api`" },
      { type: "mrkdwn", text: "*Started*\n<!date^1715693400^{date_short_pretty} at {time}|May 14 at 1:30pm>" },
    ],
  },
  { type: "divider" },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Summary*\nError rate on `POST /v1/checkout` jumped from 0.3% → 11% at 13:28 UTC. Datadog monitor `checkout-5xx` is firing. <https://app.datadog.com/monitors/123|View monitor>.",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Commander*  <@U0123456789>\n*Comms*  <@U9876543210>\n*Scribe*  _unassigned_",
    },
  },
  {
    type: "context",
    elements: [
      {
        type: "image",
        image_url: "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
        alt_text: "pagerduty",
      },
      { type: "mrkdwn", text: "Paged via PagerDuty · last update _2 min ago_" },
    ],
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Acknowledge" },
        style: "primary",
        action_id: "incident_ack",
        value: "INC-2049",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Open runbook" },
        action_id: "incident_runbook",
        value: "INC-2049",
        url: "https://runbooks.example.com/checkout-5xx",
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Escalate to SEV-1" },
        style: "danger",
        action_id: "incident_escalate",
        value: "INC-2049",
      },
    ],
  },
]);

const duplicateBlockIds = stringify([
  {
    type: "section",
    block_id: "summary_row",
    text: { type: "mrkdwn", text: "*Revenue*  $1.2M" },
  },
  {
    type: "section",
    block_id: "summary_row",
    text: { type: "mrkdwn", text: "*Customers*  4,210" },
  },
  {
    type: "divider",
    block_id: "summary_row",
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "_Three blocks share `block_id: \"summary_row\"`. Slack accepts the payload but actions from the second & third blocks get attributed to the first._",
    },
  },
]);

const twoTables = stringify([
  {
    type: "header",
    text: { type: "plain_text", text: "Quarterly report" },
  },
  {
    type: "section",
    text: { type: "mrkdwn", text: "*Q1 results*" },
  },
  {
    type: "table",
    rows: [
      [
        { type: "raw_text", text: "Metric" },
        { type: "raw_text", text: "Value" },
      ],
      [
        { type: "raw_text", text: "Revenue" },
        { type: "raw_text", text: "$1.2M" },
      ],
      [
        { type: "raw_text", text: "Customers" },
        { type: "raw_text", text: "4,210" },
      ],
    ],
  },
  {
    type: "section",
    text: { type: "mrkdwn", text: "*Q2 results*" },
  },
  {
    type: "table",
    rows: [
      [
        { type: "raw_text", text: "Metric" },
        { type: "raw_text", text: "Value" },
      ],
      [
        { type: "raw_text", text: "Revenue" },
        { type: "raw_text", text: "$1.4M" },
      ],
      [
        { type: "raw_text", text: "Customers" },
        { type: "raw_text", text: "4,890" },
      ],
    ],
  },
]);

// Build a payload that exceeds the 12,000-char cumulative markdown limit.
// Generated programmatically so the preset source stays readable.
const markdownOverflow = (() => {
  const chunk = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20);
  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "Weekly product digest" },
    },
  ];
  // ~1140 chars per chunk × 12 = ~13,680 chars total — comfortably over the cap.
  for (let i = 0; i < 12; i++) {
    blocks.push({
      type: "markdown",
      text: `### Section ${i + 1}\n\n${chunk}`,
    });
  }
  return stringify(blocks);
})();

const headerTooLong = stringify([
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "Quarterly all-hands recap: revenue, hiring, product roadmap, customer wins, infrastructure migrations, eng-org changes, and what to expect next quarter",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "_Header text is capped at 150 characters — the schema rejects anything longer._",
    },
  },
]);

// ---------- Modal presets ----------

const feedbackModal = stringify({
  type: "modal",
  callback_id: "feedback_modal",
  title: { type: "plain_text", text: "Share feedback" },
  submit: { type: "plain_text", text: "Send" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Help us improve! Your answers go to the product team — takes about a minute.",
      },
    },
    { type: "divider" },
    {
      type: "input",
      block_id: "headline",
      label: { type: "plain_text", text: "One-line summary" },
      element: {
        type: "plain_text_input",
        action_id: "headline_input",
        placeholder: { type: "plain_text", text: "What's on your mind?" },
        focus_on_load: true,
        max_length: 80,
      },
    },
    {
      type: "input",
      block_id: "details",
      label: { type: "plain_text", text: "Tell us more" },
      hint: {
        type: "plain_text",
        text: "Steps to reproduce, screenshots, links — whatever helps.",
      },
      optional: true,
      element: {
        type: "plain_text_input",
        action_id: "details_input",
        multiline: true,
        max_length: 2000,
      },
    },
    {
      type: "input",
      block_id: "rating",
      label: { type: "plain_text", text: "How are we doing?" },
      element: {
        type: "radio_buttons",
        action_id: "rating_pick",
        options: [
          {
            text: { type: "plain_text", text: ":star: :star: :star: :star: :star:  Love it", emoji: true },
            value: "5",
          },
          {
            text: { type: "plain_text", text: ":star: :star: :star: :star:  Good", emoji: true },
            value: "4",
          },
          {
            text: { type: "plain_text", text: ":star: :star: :star:  Mixed", emoji: true },
            value: "3",
          },
          {
            text: { type: "plain_text", text: ":star: :star:  Frustrating", emoji: true },
            value: "2",
          },
          {
            text: { type: "plain_text", text: ":star:  Broken", emoji: true },
            value: "1",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "areas",
      label: { type: "plain_text", text: "Which area?" },
      optional: true,
      element: {
        type: "checkboxes",
        action_id: "areas_pick",
        options: [
          { text: { type: "plain_text", text: "Onboarding" }, value: "onboarding" },
          { text: { type: "plain_text", text: "Messaging UI" }, value: "messaging" },
          { text: { type: "plain_text", text: "Notifications" }, value: "notifications" },
          { text: { type: "plain_text", text: "Mobile" }, value: "mobile" },
        ],
      },
    },
    {
      type: "input",
      block_id: "followup",
      label: { type: "plain_text", text: "Can we reach out?" },
      optional: true,
      element: {
        type: "email_text_input",
        action_id: "followup_email",
        placeholder: { type: "plain_text", text: "you@company.com" },
      },
    },
  ],
});

const createIssueModal = stringify({
  type: "modal",
  callback_id: "create_issue",
  title: { type: "plain_text", text: "New issue" },
  submit: { type: "plain_text", text: "Create" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Files a ticket in `tightknit/api`. You'll get a link back here once it's created.",
      },
    },
    { type: "divider" },
    {
      type: "input",
      block_id: "title",
      label: { type: "plain_text", text: "Title" },
      element: {
        type: "plain_text_input",
        action_id: "title_input",
        placeholder: { type: "plain_text", text: "Short, action-oriented summary" },
        focus_on_load: true,
        max_length: 120,
      },
    },
    {
      type: "input",
      block_id: "body",
      label: { type: "plain_text", text: "Description" },
      hint: {
        type: "plain_text",
        text: "Markdown is supported. Code fences and bullet lists render fine.",
      },
      element: {
        type: "plain_text_input",
        action_id: "body_input",
        multiline: true,
        min_length: 20,
      },
    },
    {
      type: "input",
      block_id: "assignee",
      label: { type: "plain_text", text: "Assignee" },
      optional: true,
      element: {
        type: "users_select",
        action_id: "assignee_pick",
        placeholder: { type: "plain_text", text: "Pick a teammate" },
      },
    },
    {
      type: "input",
      block_id: "priority",
      label: { type: "plain_text", text: "Priority" },
      element: {
        type: "static_select",
        action_id: "priority_pick",
        initial_option: {
          text: { type: "plain_text", text: ":large_yellow_circle:  P2 — Normal" },
          value: "p2",
        },
        options: [
          { text: { type: "plain_text", text: ":red_circle:  P0 — Drop everything" }, value: "p0" },
          { text: { type: "plain_text", text: ":large_orange_circle:  P1 — High" }, value: "p1" },
          { text: { type: "plain_text", text: ":large_yellow_circle:  P2 — Normal" }, value: "p2" },
          { text: { type: "plain_text", text: ":large_blue_circle:  P3 — Low" }, value: "p3" },
        ],
      },
    },
    {
      type: "input",
      block_id: "due",
      label: { type: "plain_text", text: "Due date" },
      optional: true,
      element: {
        type: "datepicker",
        action_id: "due_pick",
        placeholder: { type: "plain_text", text: "Optional" },
      },
    },
    {
      type: "input",
      block_id: "labels",
      label: { type: "plain_text", text: "Labels" },
      optional: true,
      element: {
        type: "multi_static_select",
        action_id: "labels_pick",
        placeholder: { type: "plain_text", text: "Pick any" },
        options: [
          { text: { type: "plain_text", text: "bug" }, value: "bug" },
          { text: { type: "plain_text", text: "feature" }, value: "feature" },
          { text: { type: "plain_text", text: "docs" }, value: "docs" },
          { text: { type: "plain_text", text: "tech-debt" }, value: "tech-debt" },
          { text: { type: "plain_text", text: "design" }, value: "design" },
        ],
        max_selected_items: 3,
      },
    },
  ],
});

const twoFocusOnLoad = stringify({
  type: "modal",
  title: { type: "plain_text", text: "Report a bug" },
  submit: { type: "plain_text", text: "File" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "input",
      block_id: "title",
      label: { type: "plain_text", text: "Title" },
      element: {
        type: "plain_text_input",
        action_id: "title_input",
        focus_on_load: true,
      },
    },
    {
      type: "input",
      block_id: "description",
      label: { type: "plain_text", text: "Description" },
      element: {
        type: "plain_text_input",
        action_id: "description_input",
        multiline: true,
        focus_on_load: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_Slack only allows one element per view to claim initial focus._",
      },
    },
  ],
});

const markdownOnModal = stringify({
  type: "modal",
  title: { type: "plain_text", text: "Choose a plan" },
  submit: { type: "plain_text", text: "Continue" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Pick a plan to continue.*" },
    },
    {
      type: "markdown",
      text: "**Pro** — $29/mo. Unlimited seats, priority support.",
    },
    {
      type: "input",
      block_id: "plan",
      label: { type: "plain_text", text: "Plan" },
      element: {
        type: "radio_buttons",
        action_id: "plan_pick",
        options: [
          { text: { type: "plain_text", text: "Pro" }, value: "pro" },
          { text: { type: "plain_text", text: "Team" }, value: "team" },
        ],
      },
    },
  ],
});

const modalMissingSubmit = stringify({
  type: "modal",
  title: { type: "plain_text", text: "Confirm action" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "input",
      block_id: "reason",
      label: { type: "plain_text", text: "Reason" },
      element: {
        type: "plain_text_input",
        action_id: "reason_input",
      },
    },
  ],
});

// ---------- App home presets ----------

const onboardingHome = stringify({
  type: "home",
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: ":wave:  Welcome to Tightknit, Zach" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "This is your home tab — your private control panel for the app. Knock out the setup below and you're good to go.",
      },
    },
    { type: "divider" },
    {
      type: "header",
      text: { type: "plain_text", text: "Get set up" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":green_check:  *1. Connect a channel*\nYou picked `#product-updates`. We'll post here whenever a new release ships.",
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Change" },
        action_id: "onboard_change_channel",
        value: "channel",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":white_circle:  *2. Add your team*\nInvite teammates so they show up in @mentions and assignment pickers.",
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Invite team" },
        style: "primary",
        action_id: "onboard_invite",
        value: "invite",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":white_circle:  *3. Pick your notification cadence*\nDaily digest, real-time, or off — your call.",
      },
      accessory: {
        type: "static_select",
        action_id: "onboard_cadence",
        placeholder: { type: "plain_text", text: "Choose…" },
        options: [
          { text: { type: "plain_text", text: "Daily digest at 9am" }, value: "daily" },
          { text: { type: "plain_text", text: "Real-time" }, value: "realtime" },
          { text: { type: "plain_text", text: "Off (I'll check the home tab)" }, value: "off" },
        ],
      },
    },
    { type: "divider" },
    {
      type: "header",
      text: { type: "plain_text", text: "Quick actions" },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: ":sparkles:  Create a workflow" },
          style: "primary",
          action_id: "home_create_workflow",
          value: "workflow",
        },
        {
          type: "button",
          text: { type: "plain_text", text: ":books:  Read the docs" },
          action_id: "home_docs",
          value: "docs",
          url: "https://docs.tightknit.ai",
        },
        {
          type: "button",
          text: { type: "plain_text", text: ":speech_balloon:  Talk to support" },
          action_id: "home_support",
          value: "support",
        },
      ],
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: "https://api.slack.com/img/blocks/bkb_template_images/profile_4.png",
          alt_text: "support",
        },
        {
          type: "mrkdwn",
          text: "Stuck? DM <@U0SUPPORT> or browse the <https://docs.tightknit.ai|help center>.",
        },
      ],
    },
  ],
});

const dashboardHome = stringify({
  type: "home",
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "Team dashboard" },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "_Last refreshed <!date^1715693400^{time}|just now>_ · <fakeChannel|#product> workspace" },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: "*Open issues*\n`14` _(-3 this week)_" },
        { type: "mrkdwn", text: "*PRs awaiting review*\n`6`" },
        { type: "mrkdwn", text: "*On-call*\n<@U0123456789>" },
        { type: "mrkdwn", text: "*Deploys today*\n`9` :rocket:" },
      ],
    },
    { type: "divider" },
    {
      type: "header",
      text: { type: "plain_text", text: "Needs your attention" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":red_circle:  *<https://example.com/issues/204|INC-204> · Webhook deliveries timing out*\nOpened 2h ago · assigned to <@U0123456789>",
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Open" },
        action_id: "dash_open_204",
        value: "204",
        url: "https://example.com/issues/204",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":large_yellow_circle:  *<https://example.com/issues/187|#187> · Flaky CI on `main`*\nOpened 1d ago",
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Open" },
        action_id: "dash_open_187",
        value: "187",
        url: "https://example.com/issues/187",
      },
    },
    { type: "divider" },
    {
      type: "header",
      text: { type: "plain_text", text: "Settings" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Default channel*\nNew notifications post to `#product-updates`." },
      accessory: {
        type: "overflow",
        action_id: "dash_channel_overflow",
        options: [
          { text: { type: "plain_text", text: "Change channel" }, value: "change" },
          { text: { type: "plain_text", text: "Mute notifications" }, value: "mute" },
          { text: { type: "plain_text", text: "Disconnect" }, value: "disconnect" },
        ],
      },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Workspace plan*\n*Pro* · renews on May 28, 2026" },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Manage" },
        action_id: "dash_manage_plan",
        value: "plan",
        url: "https://example.com/billing",
      },
    },
  ],
});

const markdownOnHome = stringify({
  type: "home",
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "Welcome" },
    },
    {
      type: "markdown",
      text: "## Get started\n\n- Connect a channel\n- Invite teammates\n- Set notifications\n\n_Markdown blocks render great in messages, but Slack drops them silently on home tabs._",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_Tip: use `section` + `mrkdwn` instead of a `markdown` block on home tabs._",
      },
    },
  ],
});

const tableOnHome = stringify({
  type: "home",
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "Team stats" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*This week*" },
    },
    {
      type: "table",
      rows: [
        [
          { type: "raw_text", text: "Member" },
          { type: "raw_text", text: "PRs" },
          { type: "raw_text", text: "Reviews" },
        ],
        [
          { type: "raw_text", text: "ana" },
          { type: "raw_text", text: "7" },
          { type: "raw_text", text: "12" },
        ],
        [
          { type: "raw_text", text: "zach" },
          { type: "raw_text", text: "4" },
          { type: "raw_text", text: "9" },
        ],
      ],
    },
  ],
});

const homeMissingType = stringify({
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "Welcome" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "This payload is missing the top-level `type: \"home\"` field." },
    },
  ],
});

// ---------- Preset registry ----------

export const presets: Preset[] = [
  // Message
  {
    id: "daily-standup",
    label: "Daily standup",
    surface: "message",
    blurb: "Header + sections with image accessory, context, actions, confirm dialog.",
    tone: "valid",
    json: dailyStandup,
  },
  {
    id: "incident-alert",
    label: "Incident alert",
    surface: "message",
    blurb: "Real ops pattern — fields, runbook button, escalate with danger style.",
    tone: "valid",
    json: incidentAlert,
  },
  {
    id: "duplicate-block-id",
    label: "Duplicate block_id",
    surface: "message",
    blurb: "Three blocks share one ID — Slack silently misroutes actions.",
    tone: "invalid",
    json: duplicateBlockIds,
  },
  {
    id: "two-tables",
    label: "Two table blocks",
    surface: "message",
    blurb: "Only one table block is allowed per message.",
    tone: "invalid",
    json: twoTables,
  },
  {
    id: "markdown-overflow",
    label: "Cumulative markdown > 12k",
    surface: "message",
    blurb: "Slack truncates payloads when section text totals more than 12k characters.",
    tone: "invalid",
    json: markdownOverflow,
  },
  {
    id: "header-too-long",
    label: "Header text > 150 chars",
    surface: "message",
    blurb: "Plain-text header is capped at 150 chars — the rest is silently dropped.",
    tone: "invalid",
    json: headerTooLong,
  },

  // Modal
  {
    id: "feedback-modal",
    label: "Feedback survey",
    surface: "modal",
    blurb: "Multi-field form: text, radios, checkboxes, email — with hints + max_length.",
    tone: "valid",
    json: feedbackModal,
  },
  {
    id: "create-issue-modal",
    label: "Create issue",
    surface: "modal",
    blurb: "Realistic ticket form with users_select, priority, due date, label picker.",
    tone: "valid",
    json: createIssueModal,
  },
  {
    id: "two-focus-on-load",
    label: "focus_on_load × 2",
    surface: "modal",
    blurb: "Two elements race for initial focus — Slack picks one and ignores the other.",
    tone: "invalid",
    json: twoFocusOnLoad,
  },
  {
    id: "markdown-on-modal",
    label: "markdown block on modal",
    surface: "modal",
    blurb: "`markdown` blocks render on messages only — modals show them as nothing.",
    tone: "invalid",
    json: markdownOnModal,
  },
  {
    id: "modal-missing-submit",
    label: "Modal w/ inputs, no submit",
    surface: "modal",
    blurb: "Any input block forces the modal to declare a `submit` action.",
    tone: "invalid",
    json: modalMissingSubmit,
  },

  // App home
  {
    id: "onboarding-home",
    label: "Onboarding home",
    surface: "home",
    blurb: "Welcome dashboard with setup checklist, accessories, and quick actions.",
    tone: "valid",
    json: onboardingHome,
  },
  {
    id: "dashboard-home",
    label: "Team dashboard",
    surface: "home",
    blurb: "KPI fields, attention list with buttons, settings with overflow menu.",
    tone: "valid",
    json: dashboardHome,
  },
  {
    id: "markdown-on-home",
    label: "markdown block on home",
    surface: "home",
    blurb: "Easy copy-paste mistake — `markdown` blocks are messages-only.",
    tone: "invalid",
    json: markdownOnHome,
  },
  {
    id: "table-on-home",
    label: "table on home",
    surface: "home",
    blurb: "`table` blocks render on messages only.",
    tone: "invalid",
    json: tableOnHome,
  },
  {
    id: "home-missing-type",
    label: "Missing type: \"home\"",
    surface: "home",
    blurb: "The home view envelope requires a top-level `type` field.",
    tone: "invalid",
    json: homeMissingType,
  },
];

export const defaultSurface: Surface = "message";

/**
 * Map a surface tab to the validator's `target` parameter. `message` validates
 * a bare blocks array; `modal` and `home` validate the full view envelope.
 */
export const surfaceToTarget = {
  message: "blocks",
  modal: "modal",
  home: "home",
} as const;
