# Maintaining

## Keeping up with Slack

Slack adds new block types and fields over time. To update:

1. Diff the latest at <https://docs.slack.dev/reference/block-kit> against the commit history of `src/slack-block-kit.schema.json`.
2. Add or amend the relevant `$defs/*` entry, including required / optional / maxLength / enum.
3. For new top-level blocks, add to `$defs/block.oneOf` and the `modal_view` / `home_view` inner arrays if applicable.
4. For new elements, add to the relevant parent-container whitelist (`actions_block_element`, `section_accessory_element`, `input_block_element`, `context_block_element`, or `context_actions_block_element`).
5. Add fixtures to `test/` covering both valid and invalid payloads.

## Dependency updates

Dependabot opens weekly PRs for npm packages and GitHub Actions. The
`dependabot-automerge` workflow approves and auto-merges only non-major bumps
to `devDependencies`. Everything else is held for a human to review:

- `dependencies` in `package.json` (`ajv`, `ajv-formats`) — these ship inside
  the published package, so a compromised upstream release would reach every
  consumer on the next release.
- `dependencies` in `worker/package.json` — these run in the deployed
  validation API.
- GitHub Actions bumps — these run in CI, including the release workflow that
  publishes to npm.
- Lockfile-only bumps to transitive dependencies.

Before merging a held PR, read the upstream changelog and the source diff
between the two versions, not just the lockfile diff.
