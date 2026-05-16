import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";

// RFC 3986-ish URI matcher, compatible with the `uri` format ajv-formats uses.
// Inlining lets the standalone bundle stay free of any runtime `require()`
// calls (ajv-formats's source-mode emit injects `require("ajv-formats/...")`,
// which doesn't load from an ESM file).
const URI_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s]+$/;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const schemaPath = join(repoRoot, "src", "slack-block-kit.schema.json");
const outDir = join(repoRoot, "dist");
const outPath = join(outDir, "standalone-validator.js");
const outDtsPath = join(outDir, "standalone-validator.d.ts");

const HEADER = `// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Self-contained Block Kit validator (no Ajv runtime dependency).
// Regenerate with: pnpm run compile:standalone
// Source: src/slack-block-kit.schema.json
`;

const DTS = `// AUTO-GENERATED — DO NOT EDIT BY HAND.

export type StandaloneValidateFunction = ((data: unknown) => boolean) & {
  errors?:
    | {
        instancePath: string;
        schemaPath: string;
        keyword: string;
        params: Record<string, unknown>;
        message?: string;
      }[]
    | null;
};

/** Validates a bare blocks array. */
export const validateBlocks: StandaloneValidateFunction;
/** Validates a modal view envelope. */
export const validateModal: StandaloneValidateFunction;
/** Validates a home view envelope. */
export const validateHome: StandaloneValidateFunction;
`;

const main = async (): Promise<void> => {
  const raw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw);

  // Step 1: emit standalone validators with esm: true. Ajv still inlines a few
  // require() calls into runtime helpers (equal, ucs2length) — those are why
  // we bundle in step 2.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    code: { source: true, esm: true, optimize: true },
  });
  ajv.addFormat("uri", URI_RE);
  ajv.addSchema(schema, "slack-block-kit");

  const refs = {
    validateBlocks: "slack-block-kit",
    validateModal: "slack-block-kit#/$defs/modal_view",
    validateHome: "slack-block-kit#/$defs/home_view",
  };

  for (const ref of Object.values(refs)) {
    ajv.compile(ref === "slack-block-kit" ? { $ref: "slack-block-kit" } : { $ref: ref });
  }

  const code = standaloneCode(ajv, refs);

  // Step 2: bundle through esbuild to inline ajv-runtime helpers (equal,
  // ucs2length, fast-deep-equal) so the published file is genuinely
  // dependency-free at runtime.
  await mkdir(outDir, { recursive: true });
  const stagePath = join(outDir, ".standalone-stage.js");
  await writeFile(stagePath, code);

  await build({
    entryPoints: [stagePath],
    outfile: outPath,
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: ["es2022"],
    minify: false,
    banner: { js: HEADER },
    legalComments: "none",
    logLevel: "error",
  });
  await rm(stagePath);
  await writeFile(outDtsPath, DTS);

  const final = await readFile(outPath, "utf8");
  console.log(`wrote ${outPath} (${final.length} bytes) + ${outDtsPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
