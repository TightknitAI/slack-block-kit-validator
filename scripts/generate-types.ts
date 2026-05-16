import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, type JSONSchema } from "json-schema-to-typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const schemaPath = join(repoRoot, "src", "slack-block-kit.schema.json");
const outPath = join(repoRoot, "src", "types.generated.ts");

const HEADER = `/* eslint-disable */
// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
// Regenerate with: pnpm run generate:types
// Source: src/slack-block-kit.schema.json
`;

const COMPILE_OPTS = {
  additionalProperties: false,
  bannerComment: "",
  enableConstEnums: false,
  style: { singleQuote: false, semi: true, trailingComma: "all" as const, printWidth: 120 },
  declareExternallyReferenced: true,
  unreachableDefinitions: true,
  strictIndexSignatures: true,
};

/**
 * JSON Schema validation keywords that constrain values without changing the
 * shape they accept (maxLength can't be expressed in TS anyway, etc.). When an
 * `allOf` entry contains *only* these keywords (recursively, inside any nested
 * `properties` / `items` / `additionalProperties`), it adds no type-level
 * information — keeping it would force json-schema-to-typescript to model the
 * refinement as an awkward `& { [k: string]: unknown }` intersection. Drop it.
 */
const CONSTRAINT_ONLY_KEYWORDS = new Set([
  "description",
  "format",
  "maxItems",
  "maxLength",
  "maximum",
  "minItems",
  "minLength",
  "minimum",
  "pattern",
  "title",
]);

const isConstraintOnly = (node: unknown): boolean => {
  if (node == null || typeof node !== "object" || Array.isArray(node)) {
    return false;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (CONSTRAINT_ONLY_KEYWORDS.has(key)) {
      continue;
    }
    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      const allInner = Object.values(value as Record<string, unknown>).every(isConstraintOnly);
      if (allInner) {
        continue;
      }
      return false;
    }
    if (key === "items") {
      if (isConstraintOnly(value)) {
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
};

/**
 * Walk the schema and strip constraint-only `allOf` entries so the type
 * generator produces clean types. e.g. `allOf: [{$ref: text_object}, {properties:
 * {text: {maxLength: 75}}}]` collapses to just the `$ref` for type-generation
 * purposes (the published runtime schema is unchanged).
 */
const stripConstraintOnlyAllOf = (node: unknown): unknown => {
  if (Array.isArray(node)) {
    return node.map(stripConstraintOnlyAllOf);
  }
  if (node == null || typeof node !== "object") {
    return node;
  }
  const obj = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "allOf" && Array.isArray(value)) {
      const kept = value.filter((entry) => !isConstraintOnly(entry)).map(stripConstraintOnlyAllOf);
      if (kept.length === 0) {
        // All entries were constraint-only; emit a permissive object so the
        // generator doesn't crash on an empty allOf.
        continue;
      }
      if (kept.length === 1) {
        // Merge the surviving entry up into this node. JSON Schema allows
        // sibling keywords next to $ref so the result is still well-formed.
        const surviving = kept[0] as Record<string, unknown>;
        for (const [k, v] of Object.entries(surviving)) {
          if (!(k in out)) {
            out[k] = v;
          }
        }
        continue;
      }
      out.allOf = kept;
      continue;
    }
    out[key] = stripConstraintOnlyAllOf(value);
  }
  return out;
};

const main = async (): Promise<void> => {
  const raw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw) as { $schema: string; $id: string; description?: string; $defs: Record<string, unknown> };

  // Pre-process: strip `allOf` entries that only carry runtime constraints
  // (maxLength/pattern/etc.) so type generation doesn't model them as
  // awkward `& { [k: string]: unknown }` intersections.
  const cleanedDefs = stripConstraintOnlyAllOf(schema.$defs) as Record<string, unknown>;

  // The root schema is `type: array`, so json-schema-to-typescript walks $defs
  // reachable from `items`. modal_view / home_view aren't referenced from the
  // top-level array, so we build a wrapper schema (preserving $defs) whose root
  // is a oneOf that pulls in [blocks-array, modal_view, home_view] for
  // type-discovery purposes. This doesn't touch the published schema.
  const wrapped: JSONSchema = {
    $schema: schema.$schema,
    $id: `${schema.$id}#typegen-wrapper`,
    title: "SlackBlockKitPayload",
    description: schema.description,
    $defs: cleanedDefs as JSONSchema["$defs"],
    oneOf: [
      { type: "array", minItems: 1, maxItems: 100, items: { $ref: "#/$defs/block" } },
      { $ref: "#/$defs/modal_view" },
      { $ref: "#/$defs/home_view" },
    ],
  };

  const ts = await compile(wrapped, "SlackBlockKitPayload", COMPILE_OPTS);

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${HEADER}\n${ts}`);
  console.log(`wrote ${outPath} (${ts.length} bytes)`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
