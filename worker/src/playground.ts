/**
 * Vanilla-HTML playground served at `/`. Mirrors the UX of Slack's Block Kit
 * Builder: edit a payload on the left, see validation results on the right,
 * with the current state encoded into the URL fragment so a copy-paste of the
 * address bar gives someone else the same view.
 *
 * Why the fragment and not query params: fragments (#...) never hit the
 * server, so the payload doesn't end up in CDN access logs, doesn't bloat
 * cache keys, and works around URL-length limits that would clip a real
 * POST-body-sized payload.
 *
 * The fragment shape is `#p=<base64(json)>&t=<target>&s=<surface>`. We use
 * URL-safe base64 (RFC 4648 §5) so `+`, `/`, `=` survive a copy without
 * extra URL-encoding.
 */

import type { Env } from "./types.js";

const SAMPLE_PAYLOAD = JSON.stringify(
  [
    {
      type: "section",
      text: { type: "mrkdwn", text: "Hello *world* — try editing this payload." },
    },
    { type: "divider" },
    {
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "Approve" }, style: "primary", value: "approve" },
        { type: "button", text: { type: "plain_text", text: "Deny" }, style: "danger", value: "deny" },
      ],
    },
  ],
  null,
  2,
);

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function renderPlayground(env: Env): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Slack Block Kit Validator — ${escapeHtml(env.PROVIDER_NAME)}</title>
<meta name="description" content="Validate Slack Block Kit JSON against the full schema and Slack's cross-payload rules. Hosted by ${escapeHtml(env.PROVIDER_NAME)}, powered by @tightknitai/slack-block-kit-validator." />
<link rel="canonical" href="${escapeHtml(env.PROVIDER_URL)}" />
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --fg: #111418;
    --muted: #5a6068;
    --border: #e1e4e8;
    --panel: #f6f8fa;
    --ok: #1a7f37;
    --err: #cf222e;
    --accent: #4a154b;
    --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0d1117; --fg: #e6edf3; --muted: #8b949e; --border: #30363d; --panel: #161b22; --ok: #3fb950; --err: #f85149; --accent: #ecb22e; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--fg); }
  header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  header h1 { margin: 0; font-size: 18px; font-weight: 600; }
  header .sub { color: var(--muted); font-size: 13px; margin-top: 2px; }
  header .links a { color: var(--muted); text-decoration: none; margin-left: 16px; font-size: 13px; }
  header .links a:hover { color: var(--fg); text-decoration: underline; }
  main { display: grid; grid-template-columns: 1fr 1fr; gap: 0; height: calc(100vh - 130px); min-height: 480px; }
  @media (max-width: 800px) { main { grid-template-columns: 1fr; height: auto; } }
  .pane { display: flex; flex-direction: column; min-height: 0; }
  .pane + .pane { border-left: 1px solid var(--border); }
  @media (max-width: 800px) { .pane + .pane { border-left: none; border-top: 1px solid var(--border); } }
  .pane-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: var(--panel); }
  .pane-header label { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
  select { font: inherit; font-size: 13px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); }
  button { font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 4px; border: 1px solid var(--border); background: var(--accent); color: white; cursor: pointer; }
  button:hover { opacity: .9; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  textarea { flex: 1; width: 100%; padding: 16px; border: none; resize: none; outline: none; font: 13px/1.5 var(--mono); background: var(--bg); color: var(--fg); tab-size: 2; }
  textarea:focus { background: var(--panel); }
  #result { flex: 1; padding: 16px; overflow: auto; font-size: 13px; }
  .status { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
  .status.ok { color: var(--ok); }
  .status.err { color: var(--err); }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dot.ok { background: var(--ok); }
  .dot.err { background: var(--err); }
  ul.errors { margin: 12px 0 0; padding: 0; list-style: none; }
  ul.errors li { padding: 8px 10px; margin-bottom: 6px; border-left: 3px solid var(--err); background: var(--panel); font: 12px/1.5 var(--mono); white-space: pre-wrap; word-break: break-word; }
  .empty { color: var(--muted); font-style: italic; }
  .meta { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; }
  footer { padding: 12px 24px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  footer a { color: var(--muted); }
  footer a:hover { color: var(--fg); }
  .copy-link { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .copy-link.copied { color: var(--ok); border-color: var(--ok); }
</style>
</head>
<body>
<header>
  <div>
    <h1>Slack Block Kit Validator</h1>
    <div class="sub">Catch invalid Block Kit JSON before Slack silently drops it.</div>
  </div>
  <div class="links">
    <a href="/openapi.json">API spec</a>
    <a href="${escapeHtml(env.REPO_URL)}" target="_blank" rel="noopener">GitHub</a>
    <a href="https://www.npmjs.com/package/@tightknitai/slack-block-kit-validator" target="_blank" rel="noopener">npm</a>
  </div>
</header>

<main>
  <section class="pane">
    <div class="pane-header">
      <label>Target <select id="target"><option value="blocks">blocks</option><option value="modal">modal</option><option value="home">home</option></select></label>
      <label id="surface-wrap">Surface <select id="surface"><option value="">(none)</option><option value="message">message</option><option value="modal">modal</option><option value="home">home</option></select></label>
      <button id="validate">Validate</button>
      <button id="copy-link" class="copy-link" title="Copy a shareable link to this payload">Copy link</button>
    </div>
    <textarea id="payload" spellcheck="false" aria-label="Block Kit JSON payload"></textarea>
  </section>

  <section class="pane">
    <div class="pane-header">
      <span id="status" class="status"><span class="dot"></span><span id="status-text">Edit the payload to validate</span></span>
    </div>
    <div id="result"><p class="empty">Click <b>Validate</b> or hit ⌘/Ctrl+Enter to run.</p></div>
  </section>
</main>

<footer>
  <div>Hosted by <a href="${escapeHtml(env.PROVIDER_URL)}" target="_blank" rel="noopener">${escapeHtml(env.PROVIDER_NAME)}</a> · Powered by <a href="https://www.npmjs.com/package/@tightknitai/slack-block-kit-validator" target="_blank" rel="noopener">@tightknitai/slack-block-kit-validator</a></div>
  <div>Public API rate-limited per IP. Self-host from npm for unlimited use.</div>
</footer>

<script>
  const SAMPLE = ${JSON.stringify(SAMPLE_PAYLOAD)};
  const $payload = document.getElementById("payload");
  const $target = document.getElementById("target");
  const $surface = document.getElementById("surface");
  const $surfaceWrap = document.getElementById("surface-wrap");
  const $validate = document.getElementById("validate");
  const $copy = document.getElementById("copy-link");
  const $result = document.getElementById("result");
  const $status = document.getElementById("status");
  const $statusText = document.getElementById("status-text");

  const b64encode = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
  const b64decode = (s) => {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad)));
  };

  function parseFragment() {
    const frag = location.hash.slice(1);
    if (!frag) return null;
    const params = new URLSearchParams(frag);
    const p = params.get("p");
    if (!p) return null;
    try {
      return { payload: b64decode(p), target: params.get("t") || "blocks", surface: params.get("s") || "" };
    } catch { return null; }
  }

  function writeFragment() {
    const params = new URLSearchParams();
    params.set("p", b64encode($payload.value));
    params.set("t", $target.value);
    if ($surface.value) params.set("s", $surface.value);
    history.replaceState(null, "", "#" + params.toString());
  }

  function updateSurfaceVisibility() {
    $surfaceWrap.style.display = $target.value === "blocks" ? "" : "none";
  }

  async function validate() {
    let parsed;
    try {
      parsed = JSON.parse($payload.value);
    } catch (e) {
      setStatus("err", "Invalid JSON");
      $result.innerHTML = '<ul class="errors"><li>' + escapeHtml(String(e)) + '</li></ul>';
      return;
    }

    $validate.disabled = true;
    setStatus("", "Validating…");

    const body = { input: parsed, target: $target.value };
    if ($surface.value) body.surface = $surface.value;

    try {
      const res = await fetch("/v1/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.status === 429) {
        setStatus("err", "Rate limited");
        $result.innerHTML = '<ul class="errors"><li>' + escapeHtml(data.message || "Try again in a minute.") + '</li></ul>';
        return;
      }
      if (!res.ok) {
        setStatus("err", "Error " + res.status);
        $result.innerHTML = '<ul class="errors"><li>' + escapeHtml(data.message || res.statusText) + '</li></ul>';
        return;
      }
      if (data.valid) {
        setStatus("ok", "Valid");
        $result.innerHTML = '<p>No errors. This payload will render on Slack.</p>' + metaBlock(data.meta);
      } else {
        setStatus("err", data.errors.length + " error" + (data.errors.length === 1 ? "" : "s"));
        $result.innerHTML = '<ul class="errors">' + data.errors.map((e) => '<li>' + escapeHtml(e) + '</li>').join("") + '</ul>' + metaBlock(data.meta);
      }
    } catch (e) {
      setStatus("err", "Network error");
      $result.innerHTML = '<ul class="errors"><li>' + escapeHtml(String(e)) + '</li></ul>';
    } finally {
      $validate.disabled = false;
    }
  }

  function setStatus(kind, text) {
    $status.className = "status" + (kind ? " " + kind : "");
    $status.querySelector(".dot").className = "dot" + (kind ? " " + kind : "");
    $statusText.textContent = text;
  }

  function metaBlock(meta) {
    if (!meta) return "";
    return '<div class="meta">Validator: <a href="' + escapeHtml(meta.repo || "#") + '" target="_blank" rel="noopener">' + escapeHtml(meta.validator || "") + '</a> · Hosted by <a href="' + escapeHtml(meta.providerUrl || "#") + '" target="_blank" rel="noopener">' + escapeHtml(meta.provider || "") + '</a></div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // ⌘/Ctrl+Enter to validate
  $payload.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); validate(); }
  });

  $validate.addEventListener("click", validate);
  $target.addEventListener("change", () => { updateSurfaceVisibility(); writeFragment(); });
  $surface.addEventListener("change", writeFragment);

  let writeTimer;
  $payload.addEventListener("input", () => {
    clearTimeout(writeTimer);
    writeTimer = setTimeout(writeFragment, 250);
  });

  $copy.addEventListener("click", async () => {
    writeFragment();
    try {
      await navigator.clipboard.writeText(location.href);
      $copy.textContent = "Copied!";
      $copy.classList.add("copied");
      setTimeout(() => { $copy.textContent = "Copy link"; $copy.classList.remove("copied"); }, 1500);
    } catch {
      // Clipboard API blocked (insecure context); fall back to selecting the URL.
      prompt("Copy this URL", location.href);
    }
  });

  // Initial load.
  const fromHash = parseFragment();
  if (fromHash) {
    $payload.value = fromHash.payload;
    $target.value = ["blocks", "modal", "home"].includes(fromHash.target) ? fromHash.target : "blocks";
    $surface.value = ["", "message", "modal", "home"].includes(fromHash.surface) ? fromHash.surface : "";
  } else {
    $payload.value = SAMPLE;
  }
  updateSurfaceVisibility();
</script>
</body>
</html>
`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Powered-By": `@tightknitai/slack-block-kit-validator (${env.PROVIDER_URL})`,
    },
  });
}
