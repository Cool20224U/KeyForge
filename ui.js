// KeyForge — UI wiring (browser entry point)
import { buildPassword, buildPhrase, buildPin, rate } from "./core.js";

const $ = id => document.getElementById(id);
const out = $("output");
const clone = $("clone");

function currentConfig() {
  if (mode === "phrase") {
    return { kind: "phrase", words: +$("phWords").value, sep: $("phSep").value, cap: $("phCap").checked, number: $("phNumber").checked };
  }
  if (mode === "pin") {
    return { kind: "pin", len: +$("pinLen").value, grouped: $("pinGroup").checked };
  }
  return { kind: "password", len: +$("pwLen").value, upper: $("optUpper").checked, lower: $("optLower").checked, digits: $("optDigits").checked, symbols: $("optSymbols").checked, noAmb: $("optNoAmb").checked };
}

function buildOne(cfg) {
  if (cfg.kind === "phrase") return buildPhrase(cfg);
  if (cfg.kind === "pin") return buildPin(cfg);
  return buildPassword(cfg);
}

let last = null;

function render(res) {
  last = res;
  out.textContent = res.value;
  const r = rate(res.entropy);
  const fill = $("strengthFill");
  fill.style.width = r.pct + "%";
  fill.style.background = r.color;
  $("strengthLabel").textContent = "Strength: " + r.label;
  $("entropyLabel").textContent = "~" + Math.round(res.entropy) + " bits of entropy";
}

function generate() {
  render(buildOne(currentConfig()));
}

let mode = "password";
const TABS = ["password", "phrase", "pin"];
function setMode(m) {
  mode = m;
  for (const t of TABS) {
    $("tab" + t[0].toUpperCase() + t.slice(1)).classList.toggle("active", m === t);
    $("panel" + t[0].toUpperCase() + t.slice(1)).classList.toggle("active", m === t);
  }
  $("bulkWrap").classList.toggle("visible", m === "password");
  $("bulkOut").textContent = "";
  generate();
}

$("tabPassword").addEventListener("click", () => setMode("password"));
$("tabPhrase").addEventListener("click", () => setMode("phrase"));
$("tabPin").addEventListener("click", () => setMode("pin"));
$("regenBtn").addEventListener("click", generate);

$("pwLen").addEventListener("input", e => { $("pwLenVal").textContent = e.target.value; generate(); });
$("phWords").addEventListener("input", e => { $("phWordsVal").textContent = e.target.value; generate(); });
$("pinLen").addEventListener("input", e => { $("pinLenVal").textContent = e.target.value; generate(); });
["optUpper","optLower","optDigits","optSymbols","optNoAmb"].forEach(id => $(id).addEventListener("change", generate));
["phSep","phNumber","phCap"].forEach(id => $(id).addEventListener("change", generate));
$("pinGroup").addEventListener("change", generate);

function bulkGenerate() {
  const cfg = currentConfig();
  const count = Math.min(Math.max(parseInt($("bulkCount").value, 10) || 1, 1), 100);
  const lines = [];
  for (let i = 0; i < count; i++) lines.push(buildOne(cfg).value);
  $("bulkOut").textContent = lines.join("\n");
}

$("bulkBtn").addEventListener("click", bulkGenerate);

function copyText(text, btn) {
  const done = () => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch {}
  ta.remove();
  done();
}

$("copyBtn").addEventListener("click", () => { if (last) copyText(last.value, $("copyBtn")); });
$("bulkCopyBtn").addEventListener("click", () => {
  const t = $("bulkOut").textContent;
  if (t) copyText(t, $("bulkCopyBtn"));
});

const THEME_KEY = "keyforge-theme";
function applyTheme(t) {
  document.body.classList.toggle("light", t === "light");
  $("themeBtn").textContent = t === "light" ? "🌙" : "☀️";
  try { localStorage.setItem(THEME_KEY, t); } catch {}
}
$("themeBtn").addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light") ? "dark" : "light");
});
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) applyTheme(saved);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) applyTheme("light");
} catch {}

generate();
