// KeyForge — core generation logic (pure functions, no DOM)
import WORDS from "./words.js";

export function randInt(max) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
  return x % max;
}

function pick(arr) { return arr[randInt(arr.length)]; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildPassword(opts) {
  const o = Object.assign({ len: 20, upper: true, lower: true, digits: true, symbols: false, noAmb: false }, opts);
  let upperSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerSet = "abcdefghijklmnopqrstuvwxyz";
  let digitSet = "0123456789";
  const symbolSet = "!@#$%^&*()-_=+[]{};:,.?/";
  if (o.noAmb) {
    upperSet = upperSet.replace(/[IO]/g, "");
    lowerSet = lowerSet.replace(/[lo]/g, "");
    digitSet = digitSet.replace(/[01]/g, "");
  }
  let pool = "";
  const groups = [];
  if (o.upper) { pool += upperSet; groups.push(upperSet); }
  if (o.lower) { pool += lowerSet; groups.push(lowerSet); }
  if (o.digits) { pool += digitSet; groups.push(digitSet); }
  if (o.symbols) { pool += symbolSet; groups.push(symbolSet); }
  if (!pool) { pool = lowerSet; groups.push(lowerSet); }

  const len = o.len;
  const chars = groups.map(g => pick(g));
  while (chars.length < len) chars.push(pool[randInt(pool.length)]);
  const pw = shuffle(chars.slice(0, len)).join("");
  return { value: pw, entropy: len * Math.log2(pool.length) };
}

export function buildPhrase(opts) {
  const o = Object.assign({ words: 5, sep: "-", cap: false, number: true }, opts);
  const chosen = [];
  for (let i = 0; i < o.words; i++) {
    let w;
    do { w = WORDS[randInt(WORDS.length)]; } while (chosen.includes(w));
    chosen.push(w);
  }
  const words = chosen.map(w => o.cap ? w[0].toUpperCase() + w.slice(1) : w);
  let phrase = words.join(o.sep);
  let entropy = o.words * Math.log2(WORDS.length);
  if (o.number) {
    phrase += o.sep + String(randInt(10000)).padStart(4, "0");
    entropy += Math.log2(10000);
  }
  return { value: phrase, entropy };
}

export function buildPin(opts) {
  const o = Object.assign({ len: 6, grouped: false }, opts);
  let pin = "";
  for (let i = 0; i < o.len; i++) pin += randInt(10);
  if (o.grouped) pin = pin.replace(/(\d{4})(?=\d)/g, "$1 ");
  return { value: pin, entropy: o.len * Math.log2(10) };
}

export function rate(entropy) {
  if (entropy < 40) return { label: "Weak", color: "var(--bad)", pct: 25 };
  if (entropy < 60) return { label: "Fair", color: "var(--warn)", pct: 50 };
  if (entropy < 80) return { label: "Strong", color: "var(--good)", pct: 75 };
  return { label: "Excellent", color: "var(--good)", pct: 100 };
}

export const WORD_LIST = WORDS;
