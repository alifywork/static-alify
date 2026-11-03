# static-alify

Static site with **all front-end libraries vendored locally** — nothing is pulled
from a CDN at runtime, so the site works offline and can't break when a CDN URL
changes.

## Vendored libraries

Everything lives in [`assets/`](assets/) and is committed to the repo:

| Library | Version | Path |
|---|---|---|
| Bootstrap | 5.3.8 | `assets/bootstrap/` |
| GSAP (+ ScrollTrigger, Observer, Flip, ScrollToPlugin) | 3.15.0 | `assets/gsap/` |
| Font Awesome Free | 7.3.1 | `assets/fontawesome/` |
| Geist Font (Sans + Mono, variable & static) | 1.9.0 | `assets/geist/` |

Full layout, include snippets, per-library notes and update instructions:
[`assets/README.md`](assets/README.md). Version/source metadata:
[`assets/vendor.json`](assets/vendor.json).

## UI kit

[`assets/ui/`](assets/ui/) is a **standalone shadcn/ui-style design system** in
plain CSS + vanilla JS — no Tailwind, no React, no build step, and it doesn't
depend on Bootstrap.

- `ui.css` — shadcn's **neutral** design tokens (copied verbatim from the shadcn
  registry), base/reset, 24 components, and a small Tailwind-compatible utility
  layer
- `theme.js` — light/dark with persistence and no flash of the wrong theme
- `ui.js` — dialog, dropdown, tabs, accordion, toast and clipboard behaviour,
  with focus traps, roving tabindex and full ARIA states

Type comes from the vendored Geist font, icons from Font Awesome.

Docs and markup conventions: [`assets/ui/README.md`](assets/ui/README.md).

## Pages

| Page | What it is |
|---|---|
| [`ui.html`](ui.html) | The UI kit showcase — app shell with sidebar, every component, live light/dark toggle |
| [`index.html`](index.html) | Asset self-check — verifies all four vendored libraries actually load, with no CDN requests |

## Quick start

shadcn-style UI (recommended for new pages):

```html
<head>
  <script src="assets/ui/theme.js"></script>          <!-- first, synchronous -->
  <link rel="stylesheet" href="assets/geist/geist.css">
  <link rel="stylesheet" href="assets/ui/ui.css">
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">
  <meta name="color-scheme" content="light dark">
</head>
<body>
  <button class="btn">Default</button>
  <button class="btn btn-outline">Outline</button>
  <script src="assets/ui/ui.js"></script>
</body>
```

Bootstrap-based pages instead:

```html
<head>
  <link rel="stylesheet" href="assets/geist/geist.css">
  <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">
  <style>body { font-family: var(--font-geist-sans); }</style>
</head>
<body>
  <script src="assets/gsap/js/gsap.min.js"></script>
  <script src="assets/gsap/js/ScrollTrigger.min.js"></script>
  <script src="assets/bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
```

## Preview

Any static server works:

```bash
python3 -m http.server 8080
```

Then open `/ui.html` (UI kit) or `/index.html` (asset self-check).
