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

## Quick start

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

Open [`index.html`](index.html) — it self-checks all four libraries in the
browser and demos the Bootstrap modal, GSAP ScrollTrigger scrubbing, Font
Awesome icon styles and the full Geist weight range.

Any static server works, e.g.:

```bash
python3 -m http.server 8080
```
