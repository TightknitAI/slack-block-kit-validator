import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";
import { build } from "esbuild";

// Precompiles every validator `validateBlockKit` needs into plain JS, so no
// code is generated at runtime. Ajv's runtime compile builds validators with
// `new Function()`, which a Content-Security-Policy without 'unsafe-eval'
// refuses.
//
// The output is committed (CI checks it is fresh) so tests and typecheck run
// against the same code that ships.

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const schemaPath = join(repoRoot, "src", "slack-block-kit.schema.json");
const outPath = join(repoRoot, "src", "precompiled-validators.js");
const outDtsPath = join(repoRoot, "src", "precompiled-validators.d.ts");

const HEADER = `// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Self-contained Block Kit validators (no Ajv runtime dependency, no eval).
// Regenerate with: pnpm run compile:standalone
// Source: src/slack-block-kit.schema.json
`;

/**
 * Maps each block `type` to its `$defs` entry. When a block fails the
 * top-level `oneOf`, `formatAjvErrors` re-validates it against just this
 * branch so it can report why the block is malformed instead of ~80 lines of
 * "doesn't match any of the block kinds". Keep in sync as new block kinds are
 * added to `$defs`.
 */
const BLOCK_TYPE_TO_DEF: Readonly<Record<string, string>> = {
  actions: "actions_block",
  alert: "alert_block",
  card: "card_block",
  carousel: "carousel_block",
  container: "container_block",
  context: "context_block",
  context_actions: "context_actions_block",
  data_table: "data_table_block",
  data_visualization: "data_visualization_block",
  divider: "divider_block",
  file: "file_block",
  header: "header_block",
  image: "image_block",
  input: "input_block",
  markdown: "markdown_block",
  plan: "plan_block",
  rich_text: "rich_text_block",
  section: "section_block",
  table: "table_block",
  task_card: "task_card_block",
  video: "video_block",
};

const TOP_LEVEL_REFS = {
  validateBlocks: { ref: "slack-block-kit", doc: "Validates a bare blocks array." },
  validateModal: { ref: "slack-block-kit#/$defs/modal_view", doc: "Validates a modal view envelope." },
  validateHome: { ref: "slack-block-kit#/$defs/home_view", doc: "Validates a home view envelope." },
};

const buildDts = (): string => {
  const lines = [
    "// AUTO-GENERATED — DO NOT EDIT BY HAND.",
    "",
    "export type StandaloneValidateFunction = ((data: unknown) => boolean) & {",
    "  errors?:",
    "    | {",
    "        instancePath: string;",
    "        schemaPath: string;",
    "        keyword: string;",
    "        params: Record<string, unknown>;",
    "        message?: string;",
    "      }[]",
    "    | null;",
    "};",
    "",
  ];
  for (const [name, { doc }] of Object.entries(TOP_LEVEL_REFS)) {
    lines.push(`/** ${doc} */`, `export const ${name}: StandaloneValidateFunction;`);
  }
  const blockTypes = Object.keys(BLOCK_TYPE_TO_DEF)
    .map((type) => JSON.stringify(type))
    .join(" | ");
  lines.push(
    "/** Per-block-type validators, keyed by `block.type`. */",
    `export const blockValidators: Readonly<Record<${blockTypes}, StandaloneValidateFunction>>;`,
  );
  return `${lines.join("\n")}\n`;
};

const main = async (): Promise<void> => {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));

  // Same options and formats as the Ajv instance the tests compile with, so
  // the precompiled validators accept and reject exactly what it does.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    code: { source: true, esm: true, optimize: true },
  });
  addFormats(ajv);
  ajv.addSchema(schema, "slack-block-kit");

  const refs: Record<string, string> = {};
  for (const [name, { ref }] of Object.entries(TOP_LEVEL_REFS)) {
    refs[name] = ref;
  }
  for (const def of Object.values(BLOCK_TYPE_TO_DEF)) {
    refs[def] = `slack-block-kit#/$defs/${def}`;
  }
  for (const ref of Object.values(refs)) {
    ajv.compile({ $ref: ref });
  }

  const blockValidatorsEntries = Object.entries(BLOCK_TYPE_TO_DEF)
    .map(([type, def]) => `${JSON.stringify(type)}: ${def}`)
    .join(", ");
  const code = `${standaloneCode(ajv, refs)}\nexport const blockValidators = { ${blockValidatorsEntries} };\n`;

  // Ajv's emit still require()s its runtime helpers (equal, ucs2length) and
  // ajv-formats; bundling inlines them so the file has no imports at all.
  const stageDir = join(repoRoot, "node_modules", ".cache", "build-standalone");
  await mkdir(stageDir, { recursive: true });
  const stagePath = join(stageDir, "stage.js");
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
  await writeFile(outDtsPath, buildDts());

  const final = await readFile(outPath, "utf8");
  // "Dynamic require" comes from esbuild's shim for a require() it could not inline.
  if (/Dynamic require|new Function|\beval\(/.test(final)) {
    throw new Error(`${outPath} still calls require(), eval or new Function, so it is not self-contained`);
  }
  console.log(`wrote ${outPath} (${final.length} bytes) + ${outDtsPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
