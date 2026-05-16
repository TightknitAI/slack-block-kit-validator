## Summary

<!-- What does this PR change and why? Link any related issues. -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing behavior to change)
- [ ] Schema update (changes to `src/slack-block-kit.schema.json`)
- [ ] Docs / chore (no runtime change)

## Changes

<!-- Bullet list of notable changes. Call out anything reviewers should pay extra attention to. -->

-

## Testing

- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm validate-schema` passes (if the schema changed)
- [ ] Added or updated tests under `test/` covering the change

## Schema changes

<!-- Fill out if `src/slack-block-kit.schema.json` was modified. -->

- [ ] Verified against the [Slack Block Kit reference](https://api.slack.com/reference/block-kit)
- [ ] Backwards compatible (existing valid payloads still validate)
- [ ] If breaking, called out in the summary and a release note is planned

## Checklist

- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (required for release-please)
- [ ] Public API changes are reflected in `README.md`
- [ ] No secrets, tokens, or sample tenant data committed
