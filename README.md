# KeyForge — Password & Passphrase Generator

A free, open-source password generator that runs **entirely in your browser**.
No server, no tracking, no storage — your passwords never leave your device.

## Features

- **Two modes**
  - **Password**: configurable length (6–64), upper/lowercase, digits, symbols, and a "avoid lookalikes" option (`0O1lI`) for passwords you have to type by hand.
  - **Passphrase**: memorable multi-word phrases (3–10 words) from a large word list, with your choice of separator, optional capitalization, and an appended 4-digit number. e.g. `harbor-fossil-quartz-broom-8842`
- **Live strength meter** with real entropy estimation in bits.
- **One-click copy** to clipboard.
- **Cryptographically secure randomness** via the Web Crypto API (`crypto.getRandomValues`) — with rejection sampling to avoid modulo bias.
- Guaranteed inclusion of at least one character from every selected category.

## Use it

No build step, no dependencies. Just open `index.html` in any modern browser,
or host the single file anywhere static (GitHub Pages, Netlify, a USB stick...).

## Security notes

- All generation happens client-side in JavaScript; there is no network code in this app.
- Entropy is estimated as `length × log2(pool size)` for passwords and `words × log2(wordlist size)` for passphrases, plus the appended digits.
- Rough guidance: < 40 bits weak · 40–60 fair · 60–80 strong · > 80 excellent.

## License

MIT — see [LICENSE](LICENSE).
