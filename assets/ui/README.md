# `assets/ui/` — a standalone shadcn/ui-style design system

Plain CSS + vanilla JS that reproduces the **shadcn/ui "neutral"** look for a
static site. No Tailwind, no React, no build step, no Bootstrap.

| File | Size | What it is |
|---|---|---|
| `ui.css` | ~92 KB | Tokens, base/reset, 24 components, keyframes, utility layer |
| `theme.js` | ~3 KB | Light/dark switching, persisted, no flash of wrong theme |
| `ui.js` | ~17 KB | Dialog, dropdown, tabs, accordion, toast, clipboard + a11y |

See it all working: [`/ui.html`](../../ui.html).

**Where the look comes from.** The design tokens are copied *verbatim* from
shadcn/ui's own registry
(`apps/v4/public/r/colors/neutral.json`, key `cssVarsV4`), and component metrics
(heights, radii, shadows, the focus ring) follow shadcn v4. The *implementation*
is original CSS/JS written for this repo — shadcn itself is React + Radix +
Tailwind and needs a build step. shadcn/ui is MIT licensed.

---

## Include it

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">

  <!-- FIRST, and synchronous: sets data-theme before the first paint,
       so there's no flash of the wrong theme. Don't defer this one. -->
  <script src="assets/ui/theme.js"></script>

  <link rel="stylesheet" href="assets/geist/geist.css">  <!-- provides the font families -->
  <link rel="stylesheet" href="assets/ui/ui.css">
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">  <!-- optional, for icons -->
</head>
<body>
  <!-- ... -->
  <script src="assets/ui/ui.js"></script>
  <script src="assets/gsap/js/gsap.min.js"></script>            <!-- optional, page motion -->
  <script src="assets/gsap/js/ScrollTrigger.min.js"></script>   <!-- optional -->
</body>
```

Order matters twice:

1. `theme.js` before the stylesheets — it must run pre-paint.
2. `geist.css` before `ui.css` — `ui.css` only *references* the families
   `Geist` / `Geist Mono` through `--font-ui-sans` / `--font-ui-mono`; the actual
   `@font-face` rules live in the Geist sheet. Without it you fall back to the
   system UI stack (still fine, just not Geist).

`assets/fontawesome/` is optional — components don't require icons, but the
markup uses `<i class="fa-solid …">` and `ui.js` uses them in toasts and menus.

---

## Theming

`theme.js` puts `data-theme="light|dark"` **and** a matching `.dark` class on
`<html>`. Both selectors are honoured in `ui.css`, so you can also set it by
hand or from server-rendered markup.

```js
UITheme.getMode()        // "light" | "dark" | "system"  (what's stored)
UITheme.getTheme()       // "light" | "dark"              (what's on screen)
UITheme.set("dark")      // or "light" / "system"
UITheme.toggle()         // light <-> dark, leaves "system" behind
UITheme.cycle()          // light -> dark -> system -> light
```

Declarative wiring — no JS of your own needed:

```html
<button data-ui-theme-toggle>Toggle</button>          <!-- aria-pressed + label kept in sync -->
<button data-ui-theme-menu>Cycle</button>             <!-- light -> dark -> system -->
<button data-ui-theme-set="dark">Dark</button>        <!-- explicit choice -->
<span data-ui-theme-label>Light</span>                <!-- text follows the current theme -->
```

Persisted in `localStorage["ui-theme"]`. `"system"` is stored as-is, so the page
keeps following the OS on later loads, and it re-applies live when
`prefers-color-scheme` changes. Private browsing without storage just falls back
to the system preference each load — no error.

### Changing the palette

Every colour in the system resolves through a token; nothing is hard-coded. To
use shadcn's zinc, slate, stone or gray theme instead of neutral, replace the two
token blocks at the top of `ui.css` (`:root`/`[data-theme="light"]` and
`.dark`/`[data-theme="dark"]`). The values live in the same shadcn registry path
under a different filename, e.g. `apps/v4/public/r/colors/zinc.json`.

Want a brand colour? Override just `--primary` / `--primary-foreground` (and
`--ring`) after the token block:

```css
:root { --primary: oklch(0.55 0.19 255); --primary-foreground: oklch(0.985 0 0); }
```

### Radius and shadow

`--radius: 0.625rem` drives everything. `--radius-sm/md/lg/xl` are derived from
it with the same offsets shadcn uses (`-4px`, `-2px`, `0`, `+4px`), so changing
one number re-rounds the whole system. Shadows are Tailwind v4's scale
(`shadow-xs` is the old `shadow-sm`), lifted slightly in dark mode where they
barely register against a near-black surface.

### Browser support

Colours use `oklch()` and `color-mix()` — all evergreen browsers since 2023.
`ui.css` ships a fallback block wrapped in `@supports not (color: oklch(...))`
that re-declares the palette using shadcn's own legacy HSL values, so older
browsers still get a correct (if slightly less precise) theme.

---

## Components

Class names follow shadcn's component vocabulary.

| Component | Classes |
|---|---|
| Button | `.btn` + `.btn-secondary` `.btn-destructive` `.btn-outline` `.btn-ghost` `.btn-link`; sizes `.btn-sm` `.btn-lg` `.btn-icon` `.btn-block`; `.is-loading`; `.btn-group` |
| Badge | `.badge` + `.badge-secondary` `.badge-destructive` `.badge-outline` `.badge-dot` |
| Card | `.card` `.card-header` `.card-title` `.card-description` `.card-action` `.card-content` `.card-footer` (`.is-bordered`) |
| Alert | `.alert` `.alert-destructive` + `.alert-title` `.alert-description` |
| Avatar | `.avatar` (`.avatar-sm/lg/xl`) `.avatar-fallback` `.avatar-group` |
| Forms | `.input` `.textarea` `.select` `.label` (`.label-required`) `.field` `.field-row` `.field-description` `.field-message` `.fieldset` |
| Controls | `.checkbox` `.radio` `.radio-group` `.check-row` `.radio-row` `.switch` `.switch-row` `.slider` |
| Input addon | `.input-group` + `.input-group-icon` / `.input-group-action` |
| Table | `.table-container` `.table` `.table-right` `.table-center` `.table-cell-main` `.table-cell-sub` |
| Tabs | `.tabs` `.tabs-list` `.tabs-trigger` `.tabs-panel` `.tabs-content` |
| Accordion | `.accordion` `.accordion-item` `.accordion-trigger` `.accordion-chevron` `.accordion-content` `.accordion-inner` |
| Dialog | `.dialog` (`.dialog-sm/lg`) `.dialog-overlay` `.dialog-header` `.dialog-title` `.dialog-description` `.dialog-footer` `.dialog-close`; sheets: `.dialog-sheet-left` `.dialog-sheet-right` |
| Menu | `.dropdown` `.dropdown-content` (`.w-menu` `.align-start` `.drop-up`) `.dropdown-item` (`.dropdown-item-destructive` `.dropdown-item-trailing`) `.dropdown-label` `.dropdown-sub-label` `.dropdown-separator` `.dropdown-indicator` `.popover-content` |
| Toast | `.toast-viewport` `.toast` (`.toast-success/destructive/info/warning`) `.toast-icon` `.toast-body` `.toast-title` `.toast-description` `.toast-close` `.toast-action` |
| Misc | `.separator` `.separator-vertical` `.progress` `.progress-indicator` `.skeleton` `.breadcrumb*` `.pagination*` `.kbd`/`<kbd>` `.empty` `.empty-icon/title/description` `.theme-toggle` `.sr-only` |
| Shell | `.shell` `.sidebar` (+ `.sidebar-header/content/menu/item/group-label`) `.shell-main` `.topbar` |

Layout primitives: `.container` `.stack` `.row` `.row-top` `.wrap` `.grow`
`.between` `.section`.

### Utility layer

`ui.css` ends with a small Tailwind-compatible utility set so pages compose
without Tailwind — names and values match Tailwind exactly, so shadcn markup
ports over almost unchanged:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <p class="text-sm text-muted-foreground font-medium">…</p>
  <span class="bg-muted rounded-lg p-3">…</span>
</div>
```

Covers spacing, sizing, display (including `table-cell`), flex/grid, typography,
every colour token (`bg-*`/`text-*`/`border-*`), radius, shadow, opacity and a
few misc helpers. Responsive `md:` / `lg:` / `xl:` variants exist for the
layout-critical subset, escaped the same way Tailwind does (`.lg\:flex`). It is
deliberately **not** all of Tailwind — if you keep needing a utility that isn't
there, add it to the generator rather than writing one-off page CSS.

---

## Interactive markup

`ui.js` wires behaviour from `data-ui-*` attributes. Call `UI.init()` yourself
only if you inject markup after load.

### Dialog / sheet

```html
<button class="btn" data-ui-open="my-dialog">Open</button>

<div data-ui-dialog="my-dialog" hidden>
  <div data-ui-dialog-overlay class="dialog-overlay"></div>
  <div data-ui-dialog-content class="dialog" role="dialog" aria-modal="true"
       aria-labelledby="d-title" aria-describedby="d-desc">
    <button class="dialog-close" data-ui-close aria-label="Close">…</button>
    <div class="dialog-header">
      <h2 class="dialog-title" id="d-title">Title</h2>
      <p class="dialog-description" id="d-desc">Body text.</p>
    </div>
    <input class="input" data-ui-dialog-autofocus>   <!-- optional -->
    <div class="dialog-footer">
      <button class="btn btn-ghost" data-ui-close>Cancel</button>
      <button class="btn" id="confirm">Save</button>
    </div>
  </div>
</div>
```

`data-ui-close` with no value closes the topmost dialog; give it an id to close a
specific one. For a sheet, add `.dialog-sheet-left` or `.dialog-sheet-right` to
the content element.

Behaviour: focus moves to `[data-ui-dialog-autofocus]` or the first focusable
control, `Tab` cycles inside the dialog, `Escape` closes the topmost one (nested
dialogs stack correctly), clicking the overlay closes it, focus returns to the
element that opened it, and `body` scroll is locked. `scrollbar-gutter: stable`
on `<html>` means locking the scroll can't shift the layout.

### Dropdown / popover

```html
<div data-ui-dropdown class="dropdown">
  <button class="btn btn-outline" data-ui-dropdown-trigger>Actions</button>
  <div class="dropdown-content w-menu" data-ui-dropdown-content role="menu">
    <p class="dropdown-label">Heading</p>
    <button class="dropdown-item" role="menuitem">Edit</button>
    <button class="dropdown-item" role="menuitemcheckbox" aria-checked="true">
      <span class="dropdown-indicator"><i class="fa-solid fa-check"></i></span> Pinned
    </button>
    <div class="dropdown-separator"></div>
    <button class="dropdown-item dropdown-item-destructive" role="menuitem">Delete</button>
  </div>
</div>
```

`aria-haspopup`/`aria-expanded` are set for you. `ArrowUp`/`ArrowDown`/`Home`/`End`
move through items, `Escape` closes and returns focus to the trigger, `Tab`
closes (native menu behaviour), clicking outside closes, and only one menu is
open at a time. `menuitemcheckbox` / `menuitemradio` toggle `aria-checked` and
**stay open**, like a real menu. Position with `.align-start` or `.drop-up`.
Swap `.dropdown-content` for `.popover-content` (and `role="dialog"`) to get the
roomier popover surface.

### Tabs

```html
<div data-ui-tabs class="tabs">
  <div role="tablist" class="tabs-list" aria-label="Settings">
    <button role="tab" class="tabs-trigger" id="t-1" aria-controls="p-1" aria-selected="true">One</button>
    <button role="tab" class="tabs-trigger" id="t-2" aria-controls="p-2">Two</button>
  </div>
  <div role="tabpanel" class="tabs-panel" id="p-1" aria-labelledby="t-1" tabindex="0">…</div>
  <div role="tabpanel" class="tabs-panel" id="p-2" aria-labelledby="t-2" tabindex="0" hidden>…</div>
</div>
```

Roving tabindex + arrow keys (vertical lists respect `aria-orientation="vertical"`),
`Home`/`End` jump to the ends. `ui.js` syncs the DOM to whichever tab you marked
`aria-selected="true"` on load, so the markup stays the source of truth.

### Accordion

```html
<div data-ui-accordion="single" class="accordion">   <!-- or "multiple" -->
  <div data-ui-accordion-item class="accordion-item">
    <button class="accordion-trigger" id="a-1-t" data-ui-accordion-trigger
            aria-expanded="false" aria-controls="a-1-c">
      Question
      <span class="accordion-chevron"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div class="accordion-content" id="a-1-c" data-ui-accordion-content hidden>
      <div class="accordion-inner"><p>Answer.</p></div>
    </div>
  </div>
</div>
```

Give every trigger an `id` — `ui.js` uses it for the panel's `aria-labelledby`.
Height is animated by measuring the panel and handing the value to CSS as
`--ui-accordion-height`, which is why that variable is referenced in the
keyframes but never declared in the stylesheet.

### Toast

```js
UI.toast({
  title: "Scheduled: Action Scheduler",
  description: "Your deploy is queued for 14:30 PKT.",
  variant: "success",          // success | destructive | info | warning | default
  duration: 5000,              // ms; 0 keeps it until dismissed
  action: { label: "Undo", onClick: () => { /* … */ } }
});

UI.dismissToast(node);         // the returned <li>
```

The viewport (`<ol data-ui-toast-viewport class="toast-viewport">`) is created on
first use if you didn't add one. Toasts stack newest-on-top, pause their countdown
while hovered, and announce via `role="status"` (or `role="alert"` +
`aria-live="assertive"` for `destructive`).

### Clipboard

```html
<button class="btn btn-outline" data-ui-copy="text to copy">
  <span data-ui-copy-label>Copy</span>
</button>

<!-- or copy another element's text -->
<button data-ui-copy-target="#some-pre"><span data-ui-copy-label>Copy</span></button>
```

Fires a toast, flips the label to "Copied" for 1.6 s, and falls back to a hidden
textarea when `navigator.clipboard` is unavailable (i.e. plain `http://` on a LAN
IP, where the async clipboard API is blocked as an insecure context).

---

## Accessibility

Built in, not bolted on:

- **Focus ring** — a global `:focus-visible` ring matching shadcn's
  `ring-[3px] ring-ring/50`, with per-control radius preserved so inputs and
  buttons don't get a mismatched outline.
- **Dialogs** — focus trap, focus restore, `aria-modal`, `Escape`, backdrop
  click, scroll lock, nested-dialog stack.
- **Menus & tabs** — roving tabindex, arrow/`Home`/`End` keys, correct
  `aria-expanded` / `aria-selected` / `aria-controls`.
- **Forms** — native elements throughout, so keyboard, autofill, screen readers
  and browser validation keep working. Invalid state via `aria-invalid="true"`
  (not a class), which is what shadcn targets too. Switches use `role="switch"`,
  checkboxes support the real `indeterminate` property.
- **Reduced motion** — `prefers-reduced-motion` collapses animations to ~0ms, and
  `ui.js` skips exit animations entirely rather than waiting them out.
- **Toasts** — live regions with the right politeness per variant.

Two things to keep in mind: `.checkbox` / `.radio` / `.switch` need
`appearance: none`, so they're styled native inputs — don't swap them for
`<div>`s. And every icon-only button needs an `aria-label`, since Font Awesome
icons contribute no accessible text.

---

## JS API

```js
UI.openDialog(id, openerElement?)  // -> stack entry, or null
UI.closeDialog(id)
UI.closeMenu()                     // closes whichever dropdown is open
UI.toast(options)                  // -> the <li>, for later dismissal
UI.dismissToast(node)
UI.copy(text, sourceElement?)
UI.init(rootElement?)              // re-scan after injecting markup
UITheme.*                          // see Theming above
```

All bindings are idempotent (`__uiBound` guard), so calling `UI.init()` again
after adding markup won't double-bind.

---

## Without JavaScript

`theme.js` still applies a theme (it's synchronous and tiny). Accordions and
dialogs won't open, but their content is in the DOM rather than removed, so it
stays indexable. Tabs keep whatever panel the markup marked active. Forms,
tables, buttons and every visual component are unaffected — nothing here needs
JS to render.
