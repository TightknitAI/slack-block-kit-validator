import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../src/slack-block-kit.schema.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(schema, "slack-block-kit");

/**
 * Compile a validator for a named `$defs/<name>` entry in the Slack Block Kit
 * schema. Lets tests exercise element and composition-object schemas directly
 * without wrapping each case in a full block payload.
 * @param defName - the key under `$defs` (e.g. "button_element", "confirm_object")
 * @returns a `(data) => boolean` validator — inspect `.errors` after a false return
 */
export function compileDef(defName: string) {
  return ajv.compile({
    $ref: `slack-block-kit#/$defs/${defName}`,
    $schema: "https://json-schema.org/draft/2020-12/schema",
  });
}
