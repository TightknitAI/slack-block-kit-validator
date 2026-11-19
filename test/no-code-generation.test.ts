import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// `--disallow-code-generation-from-strings` makes `eval` and `new Function`
// throw, as a Content-Security-Policy without 'unsafe-eval' does in a browser.
describe("validateBlockKit with runtime code generation disabled", () => {
  it("loads and validates, including the per-block error path", () => {
    const entry = fileURLToPath(new URL("../src/index.ts", import.meta.url));
    const script = `
      const { validateBlockKit } = await import(${JSON.stringify(entry)});
      const valid = validateBlockKit([{ type: "divider" }]);
      const invalid = validateBlockKit([{ type: "section", text: { type: "mrkdwn" } }]);
      console.log(JSON.stringify({ valid, invalid }));
    `;
    const stdout = execFileSync(
      "node",
      ["--disallow-code-generation-from-strings", "--import", "tsx", "--input-type=module", "--eval", script],
      { encoding: "utf8" },
    );
    const { valid, invalid } = JSON.parse(stdout);

    expect(valid).toEqual({ valid: true, errors: [] });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("blocks[0].text: missing required property 'text'");
  });
});
