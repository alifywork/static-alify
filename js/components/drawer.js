/* ==========================================================================
   drawer.js - REUSABLE off-canvas drawer behaviour
   --------------------------------------------------------------------------
   Markup:
     <div class="drawer" id="nav-drawer" data-drawer aria-hidden="true">
       <div class="drawer__backdrop" data-drawer-close></div>
       <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">...</aside>
     </div>

     <button data-drawer-open="nav-drawer">Menu</button>
     <button data-drawer-close>Close</button>        (value optional = topmost)

   Behaviour: focus trap, Escape, backdrop click, focus restore, body scroll
   lock, stacking for multiple drawers, and auto-close when an in-drawer
   anchor is followed. Exposes window.Drawer = { open, close, closeAll }.
   ========================================================================== */
(function () {
  "use strict";

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var stack = [];
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function get(id) {
    return document.getElementById(id) || document.querySelector('[data-drawer="' + id + '"]');
  }

  function openers(id) {
    return Array.prototype.slice.call(document.querySelectorAll('[data-drawer-open="' + id + '"]'));
  }

  function syncOpeners(id, isOpen) {
    openers(id).forEach(function (b) { b.setAttribute("aria-expanded", String(isOpen)); });
  }

  function lock(on) {
    document.body.style.overflow = on ? "hidden" : "";
  }

  function focusables(panel) {
    return Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), function (n) {
      return !n.disabled && (n.getClientRects().length > 0 || n === document.activeElement);
    });
  }

  function trap(e, panel) {
    if (e.key !== "Tab") { return; }
    var items = focusables(panel);
    if (!items.length) { e.preventDefault(); panel.focus(); return; }
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(id, opener) {
    var el = get(id);
    if (!el || el.hasAttribute("data-open")) { return null; }
    el.setAttribute("data-open", "");
    el.setAttribute("aria-hidden", "false");
    syncOpeners(id, true);

    var panel = el.querySelector(".drawer__panel") || el.firstElementChild;
    var entry = {
      id: id, el: el, panel: panel,
      opener: opener || document.activeElement,
      onKey: function (e) {
        if (stack[stack.length - 1] !== entry) { return; }
        if (e.key === "Escape") { e.preventDefault(); close(id); }
        else { trap(e, panel); }
      }
    };
    document.addEventListener("keydown", entry.onKey, true);
    stack.push(entry);
    lock(true);

    var target = panel.querySelector("[data-drawer-autofocus]") ||
                 focusables(panel).filter(function (n) { return n !== panel; })[0] ||
                 panel;
    if (!target.hasAttribute("tabindex")) { target.setAttribute("tabindex", "-1"); }
    // wait a frame so the panel is visible before focusing
    requestAnimationFrame(function () { target.focus({ preventScroll: true }); });
    return entry;
  }

  function close(id) {
    var idx = -1;
    for (var i = 0; i < stack.length; i++) { if (stack[i].id === id) { idx = i; } }
    if (idx === -1) { return; }
    var entry = stack.splice(idx, 1)[0];
    document.removeEventListener("keydown", entry.onKey, true);
    entry.el.removeAttribute("data-open");
    entry.el.setAttribute("aria-hidden", "true");
    syncOpeners(id, false);
    if (!stack.length) { lock(false); }
    var back = entry.opener && document.contains(entry.opener) ? entry.opener : openers(id)[0];
    if (back) { back.focus({ preventScroll: true }); }
  }

  function boot() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t.closest) { return; }

      var openerEl = t.closest("[data-drawer-open]");
      if (openerEl) { e.preventDefault(); open(openerEl.getAttribute("data-drawer-open"), openerEl); return; }

      var closeEl = t.closest("[data-drawer-close]");
      if (closeEl) {
        e.preventDefault();
        var v = closeEl.getAttribute("data-drawer-close");
        if (v) { close(v); } else if (stack.length) { close(stack[stack.length - 1].id); }
        return;
      }

      // following an in-drawer anchor closes the drawer first
      var link = t.closest(".drawer a[href^='#']");
      if (link && stack.length) { close(stack[stack.length - 1].id); }
    });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }

  window.Drawer = {
    open: open,
    close: close,
    closeAll: function () { while (stack.length) { close(stack[stack.length - 1].id); } },
    isOpen: function (id) { var el = get(id); return !!(el && el.hasAttribute("data-open")); }
  };
})();
