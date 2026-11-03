# static-alify

Static site with **all front-end libraries vendored locally** — nothing is pulled
from a CDN at runtime, so the site works offline and can't break when a CDN URL
changes.

## Pages

| Page | What it is |
|---|---|
| [`index.html`](index.html) | The **Alify home page** — header, ten sections, footer, two drawers |
| [`ui.html`](ui.html) | The UI kit showcase — app shell with sidebar, every component, live light/dark toggle |
| [`asset-check.html`](asset-check.html) | Asset self-check — verifies all four vendored libraries actually load, with no CDN requests |

## Site architecture

Every reusable component, every global, every section and every page owns
**exactly one CSS file and one JS file** — there is no monolithic site
stylesheet or script.

```
css/
  global/       grid.css  base.css  header.css  footer.css
  components/   section-head.css  drawer.css  slider.css  ticker.css
  sections/     hero.css  tech.css  about.css  services.css  why-us.css
                projects.css  industries.css  faqs.css  testimonials.css  contact.css
  pages/        home.css
js/
  global/       header.js  footer.js
  components/   drawer.js  slider.js  ticker.js
  sections/     hero.js  tech.js  about.js  services.js  why-us.js
                projects.js  industries.js  faqs.js  testimonials.js  contact.js
  pages/        home.js
img/            logos + generated imagery
```

- **Bootstrap is used for `container` / `row` / `col` only.** [`css/global/grid.css`](css/global/grid.css)
  is that grid extracted on its own, so nothing from Bootstrap's reboot,
  `.btn`, forms or utilities can collide with the design system. Every other
  piece of UI is built from [`assets/ui/ui.css`](assets/ui/ui.css).
- **Visual direction: premium dark agency.** [`css/global/base.css`](css/global/base.css)
  retunes the design system for the site — radius scale collapsed to `0` (sharp
  edges), a display type scale up to `clamp(7rem)`, Geist Mono
  (`--font-ui-mono`) for eyebrows / nav / counters / meta, hairlines and layered
  panels instead of drop shadows, invert-on-hover interactions, inverted text
  selection, and a fixed film-grain overlay. Dark is the **default theme**:
  `index.html` declares `<html data-ui-theme-default="dark">`, which
  `assets/ui/theme.js` honours only while the visitor has no stored choice — so
  `ui.html` still follows the OS. Light remains available from the toggle,
  because every surface is token-driven rather than hard-coded black.
- **Load order matters.** `assets/ui/theme.js` runs synchronously in `<head>`
  (no flash of the wrong theme); `js/pages/home.js` defines the shared
  `window.Reveal` helper, so it must load *before* the section scripts.
- **GSAP is a garnish, not the meal**: short fades/lifts on scroll, a gentle
  hero parallax, count-ups. Everything is skipped under
  `prefers-reduced-motion`, and content is visible by default — reveal-hiding is
  gated behind a `.js` class so a script failure can never leave the page blank.
  Where GSAP writes inline transforms (`.hero__bg`, `.hero__frame`,
  `.hero__float`) the CSS deliberately animates nothing on `transform`, so the
  two never fight.
- **Imagery** in `img/` is generated and committed, optimised for the web
  (~670 KB total). `logo-dark.png` is the black wordmark (light theme),
  `logo-light.png` the white one (dark theme); CSS swaps them with the theme.

### Reusable behaviour

| Global | Behaviour |
|---|---|
| `window.Drawer` | Off-canvas drawers sliding in from the left: focus trap, Escape, backdrop click, focus restore, body scroll lock, stacking (the nav drawer opens the About drawer on top), `aria-expanded` synced on every opener |
| `window.Sliders` | Loop/autoplay carousels with drag, arrow keys, prev/next, a progress meter and a live count; autoplay stops on hover, focus and when the section scrolls off-screen |
| `window.Tickers` | Seamless marquees — duplicates the group until it covers 2× the viewport, keeps the group count **even** so the `-50%` loop never jumps, marks the duplicates `aria-hidden`, and holds a constant px/sec speed at any width |
| `window.Reveal` | `Reveal.items()`, `Reveal.single()`, `Reveal.auto()` — one-shot scroll reveals, plus a declarative `[data-reveal]` hook |

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

## Quick start

A page built on the design system:

```html
<head>
  <script>document.documentElement.classList.add("js");</script>
  <script src="assets/ui/theme.js"></script>          <!-- first, synchronous -->
  <link rel="stylesheet" href="assets/geist/geist.css">
  <link rel="stylesheet" href="assets/ui/ui.css">
  <link rel="stylesheet" href="css/global/grid.css">  <!-- container/row/col only -->
  <link rel="stylesheet" href="css/global/base.css">
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">
  <meta name="color-scheme" content="light dark">
</head>
<body>
  <div class="container">
    <div class="row g-4">
      <div class="col-md-6"><button class="btn">Default</button></div>
      <div class="col-md-6"><button class="btn btn-outline">Outline</button></div>
    </div>
  </div>
  <script src="assets/gsap/js/gsap.min.js"></script>
  <script src="assets/gsap/js/ScrollTrigger.min.js"></script>
  <script src="assets/ui/ui.js"></script>
</body>
```

Adding a new section to a page: drop in `css/sections/<name>.css` and
`js/sections/<name>.js`, link both from the page, and reveal content with
`Reveal.items(".<name>", ".<name>__card", { stagger: .08 })`.

## Preview

Any static server works:

```bash
python3 -m http.server 8080
```

Then open `/` (home page), `/ui.html` (UI kit) or `/asset-check.html`
(asset self-check).
