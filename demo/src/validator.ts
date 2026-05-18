import {
  validateBlockKit,
  type Surface,
  type ValidationTarget,
} from "@tightknitai/slack-block-kit-validator";

export type ParseOutcome =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export interface RunOptions {
  target: ValidationTarget;
  surface?: Surface;
}

export interface RunResult {
  parse: ParseOutcome;
  /** Present only when parse succeeded. */
  validation?: { valid: boolean; errors: string[] };
}

export function parseJson(raw: string): ParseOutcome {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Input is empty." };
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return { ok: false, message };
  }
}

export function run(raw: string, { target, surface }: RunOptions): RunResult {
  const parse = parseJson(raw);
  if (!parse.ok) {
    return { parse };
  }
  const validation = validateBlockKit(parse.value, { target, surface });
  return { parse, validation };
}
