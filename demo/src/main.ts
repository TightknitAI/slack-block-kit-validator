import "./styles.css";
import type { Surface, ValidationTarget } from "@tightknitai/slack-block-kit-validator";
import { createEditor, type EditorHandle } from "./editor.ts";
import { defaultPresetId, presets, type Preset } from "./presets.ts";
import { run, type RunResult } from "./validator.ts";

const DEBOUNCE_MS = 180;

// ---------- DOM lookup helpers ----------

function el<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return node;
}

const editorMount = el<HTMLDivElement>("#editor");
const resultsEl = el<HTMLDivElement>("#results");
const parseStatusEl = el<HTMLSpanElement>("#parse-status");
const resultBadgeEl = el<HTMLSpanElement>("#result-badge");
const targetSelect = el<HTMLSelectElement>("#target-select");
const surfaceSelect = el<HTMLSelectElement>("#surface-select");
const surfaceGroup = el<HTMLDivElement>("#surface-group");
const chipsEl = el<HTMLDivElement>("#preset-chips");

// ---------- State ----------

let activePresetId: string | null = defaultPresetId;
let debounceHandle: number | null = null;

function getTarget(): ValidationTarget {
  const value = targetSelect.value;
  if (value === "blocks" || value === "modal" || value === "home") {
    return value;
  }
  return "blocks";
}

function getSurface(): Surface | undefined {
  const value = surfaceSelect.value;
  if (value === "message" || value === "modal" || value === "home") {
    return value;
  }
  return undefined;
}

// ---------- Rendering ----------

function setBadge(node: HTMLElement, text: string, kind: "neutral" | "ok" | "err" | "warn"): void {
  node.textContent = text;
  node.className = `badge badge--${kind}`;
}

function renderResult(result: RunResult): void {
  if (!result.parse.ok) {
    setBadge(parseStatusEl, "JSON error", "err");
    setBadge(resultBadgeEl, "Can't validate", "warn");
    resultsEl.innerHTML = "";
    const block = document.createElement("div");
    block.className = "error";
    block.innerHTML = `
      <span class="error__index">JSON</span>
      <pre class="error__msg"></pre>
    `;
    const pre = block.querySelector<HTMLElement>(".error__msg");
    if (pre) {
      pre.textContent = result.parse.message;
    }
    resultsEl.appendChild(block);
    return;
  }

  setBadge(parseStatusEl, "JSON ok", "neutral");

  const validation = result.validation;
  if (!validation) {
    return;
  }

  if (validation.valid) {
    setBadge(resultBadgeEl, "Valid", "ok");
    resultsEl.innerHTML = "";
    const card = document.createElement("div");
    card.className = "results__valid";
    card.innerHTML = `
      <strong>Looks good. ✓</strong>
      <p>Passed the JSON Schema and every cross-payload helper.</p>
    `;
    resultsEl.appendChild(card);
    return;
  }

  const count = validation.errors.length;
  setBadge(resultBadgeEl, `${count} ${count === 1 ? "error" : "errors"}`, "err");
  resultsEl.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "errors";
  for (const [i, message] of validation.errors.entries()) {
    const item = document.createElement("li");
    item.className = "error";
    item.innerHTML = `
      <span class="error__index">${i + 1}.</span>
      <pre class="error__msg"></pre>
    `;
    const pre = item.querySelector<HTMLElement>(".error__msg");
    if (pre) {
      pre.textContent = message;
    }
    list.appendChild(item);
  }
  resultsEl.appendChild(list);
}

function syncSurfaceGroupVisibility(): void {
  // Surface is auto-derived for modal/home targets, so only show it for blocks.
  surfaceGroup.style.display = getTarget() === "blocks" ? "" : "none";
}

function validateNow(editor: EditorHandle): void {
  const raw = editor.getDoc();
  const result = run(raw, { target: getTarget(), surface: getSurface() });
  renderResult(result);
}

function scheduleValidate(editor: EditorHandle): void {
  if (debounceHandle !== null) {
    window.clearTimeout(debounceHandle);
  }
  debounceHandle = window.setTimeout(() => {
    debounceHandle = null;
    validateNow(editor);
  }, DEBOUNCE_MS);
}

// ---------- Preset chips ----------

function renderPresetChips(onSelect: (preset: Preset) => void): void {
  chipsEl.innerHTML = "";
  for (const preset of presets) {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.textContent = preset.label;
    if (preset.tone) {
      button.dataset.tone = preset.tone;
    }
    button.setAttribute("aria-pressed", String(preset.id === activePresetId));
    button.addEventListener("click", () => onSelect(preset));
    chipsEl.appendChild(button);
  }
}

function updateChipPressedState(): void {
  for (const node of chipsEl.querySelectorAll<HTMLButtonElement>(".chip")) {
    const matches = node.textContent === presets.find((p) => p.id === activePresetId)?.label;
    node.setAttribute("aria-pressed", String(matches));
  }
}

function applyPreset(preset: Preset, editor: EditorHandle): void {
  activePresetId = preset.id;
  targetSelect.value = preset.target;
  surfaceSelect.value = preset.surface ?? "";
  syncSurfaceGroupVisibility();
  editor.setDoc(preset.json);
  updateChipPressedState();
  validateNow(editor);
}

// ---------- Bootstrap ----------

const initialPreset = presets.find((p) => p.id === defaultPresetId) ?? presets[0];
if (!initialPreset) {
  throw new Error("No presets defined");
}

targetSelect.value = initialPreset.target;
surfaceSelect.value = initialPreset.surface ?? "";
syncSurfaceGroupVisibility();

const editor = createEditor({
  parent: editorMount,
  initialDoc: initialPreset.json,
  onChange: () => {
    // Treat manual edits as leaving the preset.
    if (activePresetId !== null) {
      activePresetId = null;
      updateChipPressedState();
    }
    scheduleValidate(editor);
  },
});

renderPresetChips((preset) => applyPreset(preset, editor));

targetSelect.addEventListener("change", () => {
  syncSurfaceGroupVisibility();
  validateNow(editor);
});
surfaceSelect.addEventListener("change", () => {
  validateNow(editor);
});

// Kick off an initial validation pass.
validateNow(editor);
