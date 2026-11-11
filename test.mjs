// KeyForge headless test suite — exercises core.js logic in Node
import { buildPassword, buildPhrase, buildPin, rate, WORD_LIST } from "./core.js";

let pass = 0, fail = 0;
function assert(name, cond) { cond ? pass++ : (fail++, console.log("FAIL:", name)); }

// 1. password: length, category guarantees across all lengths
for (let i = 0; i < 200; i++) {
  const len = 6 + (i % 58);
  const r = buildPassword({ len });
  assert("len ok i=" + i, r.value.length === len);
  assert("has upper", /[A-Z]/.test(r.value));
  assert("has lower", /[a-z]/.test(r.value));
  assert("has digit", /[0-9]/.test(r.value));
  assert("no symbol by default", !/[!@#$%^&*()\-_=+\[\]{};:,.?/]/.test(r.value));
}
// 2. entropy math
const r20 = buildPassword({ len: 20 });
assert("entropy default pool", Math.abs(r20.entropy - 20 * Math.log2(26 + 26 + 10)) < 1e-9);
const rs = buildPassword({ len: 20, symbols: true });
assert("entropy with symbols", Math.abs(rs.entropy - 20 * Math.log2(26 + 26 + 10 + 24)) < 1e-9);
assert("has symbol", new RegExp("[!@#$%^&*()\\-_=+\\[\\]{};:,.?/]").test(rs.value));
const rUpperOnly = buildPassword({ len: 12, lower: false, digits: false });
assert("entropy upper-only", Math.abs(rUpperOnly.entropy - 12 * Math.log2(26)) < 1e-9);
assert("upper-only content", /^[A-Z]+$/.test(rUpperOnly.value));
// 3. no-ambiguous filter
for (let i = 0; i < 50; i++) {
  assert("no amb chars", !/[0O1lIo]/.test(buildPassword({ noAmb: true }).value));
}
// 4. empty pool falls back to lowercase
const rfb = buildPassword({ upper: false, lower: true, digits: false });
assert("fallback pool", /^[a-z]+$/.test(rfb.value));
// 5. passphrase
for (let i = 0; i < 50; i++) {
  const n = 3 + (i % 8);
  const p = buildPhrase({ words: n }).value;
  const parts = p.split("-");
  assert("phrase count i=" + i, parts.length === n + 1);
  assert("num suffix", /^\d{4}$/.test(parts[parts.length - 1]));
}
const pn = buildPhrase({ words: 5, number: false });
assert("no num when unchecked", pn.value.split("-").length === 5);
assert("phrase entropy", Math.abs(pn.entropy - 5 * Math.log2(WORD_LIST.length)) < 1e-9);
const pnum = buildPhrase({ words: 5 });
assert("phrase entropy + num", Math.abs(pnum.entropy - (5 * Math.log2(WORD_LIST.length) + Math.log2(10000))) < 1e-9);
// 6. capitalized
const pc = buildPhrase({ words: 6, cap: true, number: false }).value;
assert("capitalized", pc.split("-").every(w => /^[A-Z]/.test(w)));
// 7. no duplicate words
for (let i = 0; i < 30; i++) {
  const v = buildPhrase({ words: 8, number: false }).value;
  const ws = v.split("-");
  assert("no dup words", new Set(ws).size === ws.length);
}
// 8. separators
assert("dot sep", buildPhrase({ words: 3, sep: ".", number: false }).value.split(".").length === 3);
assert("none sep", !buildPhrase({ words: 3, sep: "", number: false }).value.includes("-"));
// 9. PIN
for (let i = 0; i < 50; i++) {
  const d = 4 + (i % 9);
  const pin = buildPin({ len: d });
  assert("pin len i=" + i, pin.value.length === d);
  assert("pin digits only", /^\d+$/.test(pin.value));
  assert("pin entropy", Math.abs(pin.entropy - d * Math.log2(10)) < 1e-9);
}
const pg = buildPin({ len: 8, grouped: true });
assert("pin grouped", /^\d{4} \d{4}$/.test(pg.value));
assert("pin grouped entropy uses raw len", Math.abs(pg.entropy - 8 * Math.log2(10)) < 1e-9);
// 10. rate thresholds
assert("rate weak", rate(30).label === "Weak");
assert("rate fair", rate(50).label === "Fair");
assert("rate strong", rate(70).label === "Strong");
assert("rate excellent", rate(90).label === "Excellent");
// 11. word list integrity
const seen = new Set(); const dups = [];
for (const w of WORD_LIST) { if (seen.has(w)) dups.push(w); seen.add(w); }
assert("wordlist no dups", dups.length === 0);
assert("wordlist size > 1000", WORD_LIST.length > 1000);

console.log(pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
