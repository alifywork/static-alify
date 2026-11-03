# `assets/` — locally vendored front-end libraries

Everything here is committed to the repo and served from disk. **No CDNs, no
network requests, no build step.** The site works offline and cannot break
because a CDN changed a URL.

| Library | Version | License | npm package |
|---|---|---|---|
| Bootstrap | 5.3.8 | MIT | `bootstrap` |
| GSAP | 3.15.0 | [Standard "no charge" license](https://gsap.com/standard-license) | `gsap` |
| Font Awesome Free | 7.3.1 | CC-BY-4.0 (icons) · OFL-1.1 (fonts) · MIT (code) | `@fortawesome/fontawesome-free` |
| Geist Font (Sans + Mono) | 1.9.0 | SIL Open Font License 1.1 | `geist` |

Machine-readable version/source list: [`vendor.json`](vendor.json).
Licence texts live next to each library (`bootstrap/LICENSE`,
`fontawesome/LICENSE.txt`, `geist/LICENSE.txt`, `gsap/LICENSE-NOTICE.txt`).

---

## Folder layout

```
assets/
├── bootstrap/
│   ├── css/   bootstrap.min.css  + grid / reboot / utilities (and .map files)
│   ├── js/    bootstrap.bundle.min.js, bootstrap.min.js (and .map files)
│   └── LICENSE
├── fontawesome/
│   ├── css/   all.min.css, solid.min.css, regular.min.css, brands.min.css, v4-shims.min.css
│   └── webfonts/  fa-solid-900, fa-regular-400, fa-brands-400, fa-v4compatibility (.woff2)
├── gsap/
│   ├── js/    gsap.min.js, ScrollTrigger, Observer, Flip, ScrollToPlugin (+ .map files)
│   └── LICENSE-NOTICE.txt
├── geist/
│   ├── fonts/sans/  Geist variable (.woff2 + .ttf) + 18 static weights (.woff2)
│   ├── fonts/mono/  Geist Mono variable (.woff2 + .ttf) + 18 static weights (.woff2)
│   ├── geist.css         ← variable build (recommended, 4 faces)
│   ├── geist-static.css  ← one face per weight/style (36 faces)
│   └── LICENSE.txt
├── vendor.json
└── README.md   (this file)
```

Each library keeps its own sub-folder **on purpose**: Font Awesome's CSS points
at `../webfonts/…`, so `css/` and `webfonts/` must stay siblings. Don't flatten
the folders or the fonts will 404.

---

## How to include them

Copy this into any page. Paths assume the page sits at the repo root — if your
page is one level deeper, prefix with `../`.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Geist first: @font-face + the --font-geist-* custom properties -->
  <link rel="stylesheet" href="assets/geist/geist.css">
  <!-- Bootstrap overrides its own font stack, so load it after Geist -->
  <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">

  <style>
    body { font-family: var(--font-geist-sans); }
    code, pre, kbd { font-family: var(--font-geist-mono); }
  </style>
</head>
<body>

  <i class="fa-solid fa-bolt"></i>
  <i class="fa-regular fa-heart"></i>
  <i class="fa-brands fa-github"></i>

  <!-- GSAP core first, then plugins, then Bootstrap JS -->
  <script src="assets/gsap/js/gsap.min.js"></script>
  <script src="assets/gsap/js/ScrollTrigger.min.js"></script>
  <script src="assets/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script>
    gsap.registerPlugin(ScrollTrigger);
  </script>
</body>
</html>
```

A working example of all four together is [`/index.html`](../index.html).

### Bootstrap

- `js/bootstrap.bundle.min.js` — **use this one.** Includes Popper, so
  dropdowns, tooltips, popovers and modals work.
- `js/bootstrap.min.js` — Bootstrap without Popper; only if you don't use those.
- `css/bootstrap.min.css` — full framework. Prefer the partials
  (`bootstrap-grid`, `bootstrap-reboot`, `bootstrap-utilities`) to ship less CSS.
- RTL variants were **not** vendored — ask if you need them.

### GSAP

Core `gsap.min.js` already contains `CSSPlugin`. The vendored plugins:

| File | What it does |
|---|---|
| `ScrollTrigger.min.js` | Scroll-driven animation, pinning, scrubbing |
| `Observer.min.js` | Unified pointer / touch / wheel events |
| `Flip.min.js` | Animate between layout states |
| `ScrollToPlugin.min.js` | Smooth-scroll to a position or element |

Always register before use: `gsap.registerPlugin(ScrollTrigger, Flip);`
As of 2025 every GSAP plugin is free — if you need another one
(`SplitText`, `MorphSVGPlugin`, `DrawSVGPlugin`, `ScrollSmoother`, …) it can be
added the same way; say which and I'll vendor it.

### Font Awesome

- `css/all.min.css` covers **solid + regular + brands** in one file — the normal choice.
- Load only what you use with `solid.min.css` / `regular.min.css` / `brands.min.css`
  (each also needs `fontawesome.min.css`, which was not vendored — ask if you want it).
- `v4-shims.min.css` is included for old `fa fa-*` markup from v4.
- FA 7 ships **woff2 only** (no `.ttf`) — fine for every browser in use.
- Families used: `"Font Awesome 7 Free"` (solid weight 900 / regular 400) and
  `"Font Awesome 7 Brands"` (weight 400).

### Geist

Two builds, pick one:

| File | Faces | When to use |
|---|---|---|
| `geist.css` | 4 | **Default.** Variable fonts — one 68 KB file covers weights 100–900. |
| `geist-static.css` | 36 | One file per weight/style. Use for very old browsers or if you need to preload a single weight. |

Both expose the families `Geist` and `Geist Mono`, and `geist.css` also defines
the stacks `--font-geist-sans` / `--font-geist-mono`.

Loading **both** is harmless but wasteful — the static faces would win for their
exact weights while the variable face covers everything else.

Notes:
- **Static weights are woff2-only.** Upstream also ships a `.ttf` for every
  static weight (~5 MB extra); they were dropped because every browser that
  supports `@font-face` supports woff2, and a `.ttf` fallback would never be
  requested. The four *variable* `.ttf` files **are** kept — those are genuinely
  useful for design tools and cover the whole weight range in one file. Want the
  static `.ttf`s back? `npm pack geist@1.9.0`, then copy
  `dist/fonts/geist-{sans,mono}/*.ttf` in and re-add the `format('truetype')`
  line to each rule in `geist-static.css`.
- `Geist Pixel` and `Geist Serif` ship in the same npm package but were **not**
  vendored, to keep the folder focused. Easy to add on request.
- The two variable *italic* files were renamed from upstream's
  `Geist-Italic[wght].woff2` → `Geist-ItalicVariable.woff2`. Brackets need
  percent-encoding in URLs; the rename avoids that footgun. Everything else
  keeps its upstream filename.
- Upstream's static files carry misleading internal names (`Geist-UltraBlack.ttf`
  reports family `Geist ExtraBold`, weight 800). `geist-static.css` sets
  `font-weight`/`font-style` explicitly from each file's real `OS/2` metadata,
  so the internal names don't matter.

---

## Updating a library

Re-fetch from npm and overwrite the folder — the layout above is stable:

```bash
cd /tmp && npm pack bootstrap@latest        # or gsap, @fortawesome/fontawesome-free, geist
tar xzf bootstrap-*.tgz
cp package/dist/css/bootstrap.min.css*  <repo>/assets/bootstrap/css/
cp package/dist/js/bootstrap.bundle.min.js* <repo>/assets/bootstrap/js/
```

Then bump the version in `vendor.json`, the table at the top of this file, and
the footer of `/index.html`.

If you regenerate the Geist CSS, note that the `font-weight` values are read
from the font binaries themselves (`fvar` for the variable range, `OS/2
usWeightClass` + the italic flag for the statics) — don't guess them from
filenames, since upstream's filenames disagree with their metadata. Reading
`.woff2` metadata needs `pip install fonttools brotli`; alternatively read the
metadata from upstream's `.ttf` of the same name.

## Verifying

Open `/index.html` — it self-checks all four libraries in the browser
(Bootstrap JS API present, GSAP + ScrollTrigger registered, all three Font
Awesome webfont styles resolved, Geist Sans/Mono faces resolved) and reports
pass/fail per card, then demonstrates the Bootstrap modal, GSAP ScrollTrigger
scrubbing and the full Geist weight range.

Nothing on that page touches the network beyond files in this repo.
