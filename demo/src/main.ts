import "./styles.css";
import type { Surface } from "@tightknitai/slack-block-kit-validator";
import { createEditor, type EditorHandle } from "./editor.ts";
import {
  defaultSurface,
  presets,
  surfaceToTarget,
  type Preset,
} from "./presets.ts";
import { run, type RunResult } from "./validator.ts";

const DEBOUNCE_MS = 180;

// ---------- DOM lookup ----------

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
const tabsContainer = el<HTMLDivElement>("#surface-tabs");
const aboutEl = el<HTMLParagraphElement>("#surface-about");
const chipsEl = el<HTMLDivElement>("#preset-chips");
const presetBlurbEl = el<HTMLParagraphElement>("#preset-blurb");
const themeToggleBtn = el<HTMLButtonElement>("#theme-toggle");

const tabButtons = Array.from(
  tabsContainer.querySelectorAll<HTMLButtonElement>(".surface-tab"),
);

// ---------- State ----------

let activeSurface: Surface = defaultSurface;
let activePresetId: string | null = null;
let debounceHandle: number | null = null;
// Suppresses the "manual edit" path during programmatic preset loads — the
// CodeMirror updateListener fires synchronously inside setDoc, which would
// otherwise wipe activePresetId before the chip can render as pressed.
let applyingPreset = false;

const ABOUT_COPY: Record<Surface, string> = {
  message: `Validates as a bare <code>blocks</code> array with <code>surface: "message"</code>.`,
  modal: `Validates as a <code>modal_view</code> envelope: <code>{ type: "modal", title, blocks, ... }</code>.`,
  home: `Validates as a <code>home_view</code> envelope: <code>{ type: "home", blocks }</code>.`,
};

const DEFAULT_BLURB: Record<Surface, string> = {
  message: "Renders in a Slack channel or DM. Try the chips above for real-world patterns.",
  modal: "Opened via <code>views.open</code> from a slash command, button, or shortcut.",
  home: "Published to a user's app home tab via <code>views.publish</code>.",
};

// ---------- Validation ----------

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

function validateNow(editor: EditorHandle): void {
  const raw = editor.getDoc();
  const target = surfaceToTarget[activeSurface];
  // For modal/home targets, the validator derives surface from the envelope.
  // For message, pass surface explicitly so cross-surface rules fire.
  const surface = target === "blocks" ? activeSurface : undefined;
  const result = run(raw, { target, surface });
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

// ---------- Surface tabs ----------

function setActiveSurface(surface: Surface, editor: EditorHandle): void {
  if (surface === activeSurface) {
    return;
  }
  activeSurface = surface;

  for (const tab of tabButtons) {
    tab.setAttribute(
      "aria-selected",
      String(tab.dataset.surface === surface),
    );
  }

  aboutEl.innerHTML = ABOUT_COPY[surface];

  renderChips(editor);

  // Auto-load the first valid preset for the new surface so the editor never
  // sits with a payload that doesn't match the active tab.
  const firstValid =
    presets.find((p) => p.surface === surface && p.tone === "valid") ??
    presets.find((p) => p.surface === surface);
  if (firstValid) {
    applyPreset(firstValid, editor);
  } else {
    setBlurb(DEFAULT_BLURB[surface]);
    validateNow(editor);
  }
}

// ---------- Preset chips ----------

function setBlurb(html: string): void {
  presetBlurbEl.innerHTML = html;
}

function renderChips(editor: EditorHandle): void {
  chipsEl.innerHTML = "";
  const list = presets.filter((p) => p.surface === activeSurface);
  for (const preset of list) {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.textContent = preset.label;
    button.dataset.tone = preset.tone;
    button.dataset.presetId = preset.id;
    button.title = preset.blurb;
    button.setAttribute("aria-pressed", String(preset.id === activePresetId));
    button.addEventListener("click", () => applyPreset(preset, editor));
    chipsEl.appendChild(button);
  }
}

function updateChipPressedState(): void {
  for (const node of chipsEl.querySelectorAll<HTMLButtonElement>(".chip")) {
    node.setAttribute(
      "aria-pressed",
      String(node.dataset.presetId === activePresetId),
    );
  }
}

function applyPreset(preset: Preset, editor: EditorHandle): void {
  applyingPreset = true;
  editor.setDoc(preset.json);
  applyingPreset = false;
  activePresetId = preset.id;
  setBlurb(preset.blurb);
  updateChipPressedState();
  validateNow(editor);
}

// ---------- Bootstrap ----------

const initialPreset =
  presets.find((p) => p.surface === defaultSurface && p.tone === "valid") ??
  presets[0];
if (!initialPreset) {
  throw new Error("No presets defined");
}

activeSurface = initialPreset.surface;
activePresetId = initialPreset.id;

for (const tab of tabButtons) {
  tab.setAttribute(
    "aria-selected",
    String(tab.dataset.surface === activeSurface),
  );
}
aboutEl.innerHTML = ABOUT_COPY[activeSurface];
setBlurb(initialPreset.blurb);

const editor = createEditor({
  parent: editorMount,
  initialDoc: initialPreset.json,
  onChange: () => {
    if (applyingPreset) {
      return;
    }
    if (activePresetId !== null) {
      activePresetId = null;
      setBlurb(`Modified — running against ${labelFor(activeSurface)}.`);
      updateChipPressedState();
    }
    scheduleValidate(editor);
  },
});

renderChips(editor);

for (const tab of tabButtons) {
  tab.addEventListener("click", () => {
    const next = tab.dataset.surface as Surface | undefined;
    if (next === "message" || next === "modal" || next === "home") {
      setActiveSurface(next, editor);
    }
  });
}

// ---------- Theme toggle ----------
// The initial theme is applied in index.html before paint to avoid flash.
// Here we just sync the button label and persist user choice.

const THEME_KEY = "sbkv-theme";
type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function syncToggleLabel(): void {
  const theme = currentTheme();
  const next = theme === "dark" ? "light" : "dark";
  themeToggleBtn.setAttribute("aria-label", `Switch to ${next} mode`);
  themeToggleBtn.title = `Switch to ${next} mode`;
}

themeToggleBtn.addEventListener("click", () => {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore — private mode, etc. */
  }
  syncToggleLabel();
});

syncToggleLabel();

validateNow(editor);

function labelFor(surface: Surface): string {
  if (surface === "message") return "the Message surface";
  if (surface === "modal") return "the Modal envelope";
  return "the App Home envelope";
}
