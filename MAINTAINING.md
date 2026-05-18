# Maintaining

## Keeping up with Slack

Slack adds new block types and fields over time. To update:

1. Diff the latest at <https://docs.slack.dev/reference/block-kit> against the commit history of `src/slack-block-kit.schema.json`.
2. Add or amend the relevant `$defs/*` entry, including required / optional / maxLength / enum.
3. For new top-level blocks, add to `$defs/block.oneOf` and the `modal_view` / `home_view` inner arrays if applicable.
4. For new elements, add to the relevant parent-container whitelist (`actions_block_element`, `section_accessory_element`, `input_block_element`, `context_block_element`, or `context_actions_block_element`).
5. Add fixtures to `test/` covering both valid and invalid payloads.
