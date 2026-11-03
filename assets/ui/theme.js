/* ==========================================================================
   theme.js - light/dark switching for assets/ui/ui.css
   --------------------------------------------------------------------------
   Load this SYNCHRONOUSLY in <head>, before any stylesheet paints:

     <script src="assets/ui/theme.js"></script>

   It writes data-theme (and a matching .dark class) onto <html> before the
   first paint, so there is no flash of the wrong theme. Keeping it a separate
   tiny file means it can't be deferred or bundled away by accident.

   Modes: "light" | "dark" | "system"   ("system" follows prefers-color-scheme)
   Persisted in localStorage under "ui-theme". No storage / private mode and
   it silently falls back to the system preference every load.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "ui-theme";
  var root = document.documentElement;
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function readStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function writeStored(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode: ignore */ }
  }

  // "system" is stored as-is so the page keeps following the OS on later loads.
  var mode = readStored();
  if (mode !== "light" && mode !== "dark" && mode !== "system") {
    // A page may declare its own starting theme, e.g. <html data-ui-theme-default="dark">.
    // Only honoured while the visitor has no stored choice of their own.
    var declared = root.getAttribute("data-ui-theme-default");
    mode = (declared === "light" || declared === "dark") ? declared : "system";
  }

  function resolve(m) {
    if (m === "light" || m === "dark") { return m; }
    return query && query.matches ? "dark" : "light";
  }

  function apply() {
    var theme = resolve(mode);
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    // Drives native UI: form controls, scrollbars, and the <meta name="color-scheme">
    root.style.colorScheme = theme;
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) { meta.setAttribute("content", theme === "dark" ? "dark" : "light"); }
    announce(theme);
  }

  // Tell any toggle buttons what the current state is, without them polling.
  function announce(theme) {
    var nodes = document.querySelectorAll("[data-ui-theme-toggle], [data-ui-theme-label]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.hasAttribute("data-ui-theme-label")) {
        n.textContent = theme === "dark" ? "Dark" : "Light";
      } else {
        n.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
        n.setAttribute("aria-pressed", String(theme === "dark"));
      }
    }
  }

  var api = {
    /** Current stored mode: "light" | "dark" | "system" */
    getMode: function () { return mode; },
    /** What is actually on screen right now: "light" | "dark" */
    getTheme: function () { return resolve(mode); },
    /** Pass "light", "dark" or "system" */
    set: function (m) {
      if (m !== "light" && m !== "dark" && m !== "system") { return; }
      mode = m; writeStored(m); apply();
    },
    /** Flip between light and dark, leaving "system" behind */
    toggle: function () { api.set(api.getTheme() === "dark" ? "light" : "dark"); },
    /** light -> dark -> system -> light */
    cycle: function () {
      var order = ["light", "dark", "system"];
      api.set(order[(order.indexOf(mode) + 1) % order.length]);
    }
  };

  // OS theme changed while we're in "system" mode: follow it live.
  if (query) {
    var onChange = function () { if (mode === "system") { apply(); } };
    if (query.addEventListener) { query.addEventListener("change", onChange); }
    else if (query.addListener) { query.addListener(onChange); }   // Safari < 14
  }

  apply();
  window.UITheme = api;

  // Wire up toggles declared in markup. Runs now (for <head> placement the
  // buttons don't exist yet) and again on DOMContentLoaded.
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest
        ? e.target.closest("[data-ui-theme-toggle], [data-ui-theme-menu]")
        : null;
      if (!t) { return; }
      e.preventDefault();
      if (t.hasAttribute("data-ui-theme-menu")) { api.cycle(); } else { api.toggle(); }
    });

    // A dropdown of explicit choices: <button data-ui-theme-set="dark">
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-ui-theme-set]") : null;
      if (!t) { return; }
      api.set(t.getAttribute("data-ui-theme-set"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
  // Re-announce once markup exists, in case buttons were added after apply().
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { announce(api.getTheme()); });
  }
})();
