# KeyForge — Password, Passphrase & PIN Generator

A free, open-source generator that runs **entirely in your browser**.
No server, no tracking, no storage — your secrets never leave your device.

Works as a **web app** (single page, hostable anywhere) and as a **Chrome extension**.

## Features

- **Three modes**
  - **Password**: length 6–64, upper/lowercase, digits, symbols, and an "avoid lookalikes" option (`0O1lI`) for passwords you type by hand.
  - **Passphrase**: memorable multi-word phrases from a 1,434-word list — e.g. `harbor-fossil-quartz-broom-8842`. Choose separator, capitalization, and optional 4-digit suffix.
  - **PIN**: 4–12 digits, with optional grouping (`1234 5678`).
- **Bulk generation** (password mode): generate up to 100 at once, copy the whole list.
- **Light/dark theme**: toggle manually, or follow your system preference; remembers your choice.
- **Live strength meter** with real entropy estimation in bits.
- **One-click copy** to clipboard.
- **Cryptographically secure randomness** via the Web Crypto API, with rejection sampling to eliminate modulo bias.
- Guaranteed inclusion of at least one character from every selected category.

## Use it

### Web app
Open `index.html` directly in any modern browser, or host the files anywhere
static (GitHub Pages, Netlify, ...).

### Chrome extension
1. Download this repo (Code → Download ZIP) and unzip it.
2. Visit `chrome://extensions`, enable **Developer mode** (top right).
3. Click **Load unpacked** and select the unzipped folder.
4. Pin the KeyForge icon to your toolbar — click it anytime for a fresh password.

## Security notes

- All generation happens client-side; there is no network code in this app.
- Entropy estimates: `length × log₂(pool size)` for passwords, `words × log₂(wordlist size)` for passphrases, `digits × log₂(10)` for PINs.
- Rough guidance: < 40 bits weak · 40–60 fair · 60–80 strong · > 80 excellent.

## Development

```
node test.mjs   # runs the headless test suite (1,350+ assertions)
```

- `words.js` — word list (data)
- `core.js` — generation logic, pure functions, no DOM
- `ui.js` — DOM wiring
- `style.css` / `index.html` — presentation
- `manifest.json` / `icons/` — Chrome extension packaging

## License

MIT — see [LICENSE](LICENSE).
