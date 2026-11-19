// Standalone entry: `@tightknitai/slack-block-kit-validator/standalone`.
// The raw precompiled validators, without the caveat helpers or error
// formatting `validateBlockKit` adds on top.

export {
  type StandaloneValidateFunction,
  validateBlocks,
  validateHome,
  validateModal,
} from "./precompiled-validators.js";
