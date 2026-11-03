/* ==========================================================================
   ui.js - behaviour for assets/ui/ui.css
   --------------------------------------------------------------------------
   Dependency-free (no Bootstrap, no jQuery). Implements the parts of
   shadcn/ui that need JS, with the accessibility that Radix gives React apps:

     Dialog / Sheet   focus trap, Escape, backdrop click, focus restore,
                      aria-modal, body scroll lock
     Dropdown menu    roving focus, Arrow/Home/End keys, Escape, outside click,
                      aria-expanded / aria-haspopup
     Tabs             roving tabindex, Arrow/Home/End, aria-selected, panels
     Accordion        single or multiple mode, animated height, aria-expanded
     Toast            imperative API, stacking viewport, hover-to-pause,
                      role="status"
     Copy             clipboard with a transient "copied" state

   Markup is wired with data attributes - see assets/ui/README.md for the
   exact conventions. Everything degrades: with JS off, dialog/dropdown
   triggers do nothing but tabs and accordions keep their content in the DOM.

   Load at the end of <body>:
     <script src="assets/ui/ui.js"></script>
   ========================================================================== */
(function () {
  "use strict";

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(",");

  var reducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  function $$(sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  }

  /** Run cb after the element's next animation, or immediately if there is
      none / motion is reduced. Always fires exactly once. */
  function afterAnim(el, cb) {
    if (!el || reducedMotion.matches) { cb(); return; }
    var done = false;
    var finish = function () {
      if (done) { return; }
      done = true;
      el.removeEventListener("animationend", finish);
      clearTimeout(timer);
      cb();
    };
    var timer = setTimeout(finish, 400);      // safety net if no animation runs
    el.addEventListener("animationend", finish);
  }

  /* ========================================================================
     DIALOG / SHEET
     ====================================================================== */

  var openStack = [];                          // nested dialogs: Escape closes top

  function dialogParts(wrapper) {
    return {
      wrapper: wrapper,
      overlay: wrapper.querySelector("[data-ui-dialog-overlay]"),
      content: wrapper.querySelector("[data-ui-dialog-content]") ||
               wrapper.querySelector(".dialog")
    };
  }

  function lockScroll(lock) {
    document.body.classList.toggle("is-locked", lock);
  }

  function trapFocus(e, container) {
    if (e.key !== "Tab") { return; }
    var items = $$(FOCUSABLE, container).filter(function (n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
    if (!items.length) { e.preventDefault(); container.focus(); return; }
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function openDialog(id, opener) {
    var wrapper = document.querySelector('[data-ui-dialog="' + id + '"]') ||
                  document.getElementById(id);
    if (!wrapper) { return null; }
    var p = dialogParts(wrapper);
    if (!p.content || wrapper.hasAttribute("data-open")) { return null; }

    wrapper.setAttribute("data-open", "");
    wrapper.hidden = false;
    if (p.overlay) { p.overlay.setAttribute("data-state", "open"); p.overlay.hidden = false; }
    p.content.setAttribute("data-state", "open");

    var entry = {
      id: id, wrapper: wrapper, overlay: p.overlay, content: p.content,
      opener: opener || document.activeElement,
      onKeydown: function (e) {
        if (openStack[openStack.length - 1] !== entry) { return; }
        if (e.key === "Escape") { e.stopPropagation(); closeDialog(id); }
        else { trapFocus(e, p.content); }
      }
    };
    document.addEventListener("keydown", entry.onKeydown, true);
    openStack.push(entry);
    lockScroll(true);

    // Focus the first control, or the dialog itself so Escape/Tab still work.
    var target = p.content.querySelector("[data-ui-dialog-autofocus]") ||
                 $$(FOCUSABLE, p.content).filter(function (n) { return n.offsetParent !== null; })[0] ||
                 p.content;
    if (!target.hasAttribute("tabindex")) { target.setAttribute("tabindex", "-1"); }
    target.focus({ preventScroll: true });
    return entry;
  }

  function closeDialog(id) {
    var idx = -1;
    for (var i = 0; i < openStack.length; i++) { if (openStack[i].id === id) { idx = i; } }
    if (idx === -1) { return; }
    var entry = openStack.splice(idx, 1)[0];

    document.removeEventListener("keydown", entry.onKeydown, true);
    entry.content.setAttribute("data-state", "closed");
    if (entry.overlay) { entry.overlay.setAttribute("data-state", "closed"); }

    afterAnim(entry.content, function () {
      entry.wrapper.hidden = true;
      entry.wrapper.removeAttribute("data-open");
      if (entry.overlay) { entry.overlay.hidden = true; }
      entry.content.removeAttribute("data-state");
      if (entry.overlay) { entry.overlay.removeAttribute("data-state"); }
    });

    if (!openStack.length) { lockScroll(false); }
    if (entry.opener && document.contains(entry.opener)) {
      entry.opener.focus({ preventScroll: true });
    }
  }

  /* ========================================================================
     DROPDOWN MENU / POPOVER
     ====================================================================== */

  var openDropdown = null;

  function menuItems(content) {
    return $$('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], .dropdown-item', content)
      .filter(function (n) { return !n.hasAttribute("disabled") && !n.hasAttribute("data-disabled"); });
  }

  function openMenu(dd) {
    if (openDropdown && openDropdown !== dd) { closeMenu(openDropdown); }
    var trigger = dd.trigger, content = dd.content;
    content.hidden = false;
    content.setAttribute("data-state", "open");
    trigger.setAttribute("aria-expanded", "true");
    openDropdown = dd;
    var items = menuItems(content);
    if (items.length) { items[0].focus({ preventScroll: true }); }
  }

  function closeMenu(dd, returnFocus) {
    if (!dd) { return; }
    var trigger = dd.trigger, content = dd.content;
    content.setAttribute("data-state", "closed");
    trigger.setAttribute("aria-expanded", "false");
    afterAnim(content, function () {
      content.hidden = true;
      content.removeAttribute("data-state");
    });
    if (openDropdown === dd) { openDropdown = null; }
    if (returnFocus !== false && document.contains(trigger)) {
      trigger.focus({ preventScroll: true });
    }
  }

  function initDropdown(dd) {
    var trigger = dd.trigger, content = dd.content;
    trigger.setAttribute("aria-haspopup", content.getAttribute("role") === "menu" ? "menu" : "dialog");
    trigger.setAttribute("aria-expanded", "false");
    if (!content.hasAttribute("role")) { content.setAttribute("role", "menu"); }

    trigger.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (openDropdown === dd) { closeMenu(dd); } else { openMenu(dd); }
    });

    content.addEventListener("keydown", function (e) {
      var items = menuItems(content);
      var i = items.indexOf(document.activeElement);
      switch (e.key) {
        case "Escape":
          e.preventDefault(); e.stopPropagation(); closeMenu(dd); break;
        case "ArrowDown":
          e.preventDefault();
          if (items.length) { items[(i + 1 + items.length) % items.length].focus(); } break;
        case "ArrowUp":
          e.preventDefault();
          if (items.length) { items[(i - 1 + items.length) % items.length].focus(); } break;
        case "Home":
          e.preventDefault(); if (items.length) { items[0].focus(); } break;
        case "End":
          e.preventDefault(); if (items.length) { items[items.length - 1].focus(); } break;
        case "Tab":
          // Leaving the menu with Tab closes it, matching native menu behaviour.
          closeMenu(dd, false); break;
      }
    });

    // Selecting an item closes the menu unless it's a checkbox/radio row.
    content.addEventListener("click", function (e) {
      var item = e.target.closest ? e.target.closest(".dropdown-item") : null;
      if (!item || !content.contains(item)) { return; }
      var role = item.getAttribute("role") || "";
      if (role === "menuitemcheckbox" || role === "menuitemradio") {
        var checked = item.getAttribute("aria-checked") === "true";
        item.setAttribute("aria-checked", String(!checked));
        var ind = item.querySelector(".dropdown-indicator");
        if (ind) { ind.innerHTML = !checked ? '<i class="fa-solid fa-check"></i>' : ""; }
        e.preventDefault();
        return;                                  // stay open, like a real menu
      }
      closeMenu(dd, false);
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        if (openDropdown !== dd) { e.preventDefault(); openMenu(dd); }
      }
    });
  }

  /* ========================================================================
     TABS
     ====================================================================== */

  function initTabs(tabs) {
    var triggers = $$('[role="tab"]', tabs);
    if (!triggers.length) { return; }
    var list = triggers[0].closest('[role="tablist"]');
    var vertical = list && list.getAttribute("aria-orientation") === "vertical";
    var nextKey = vertical ? "ArrowDown" : "ArrowRight";
    var prevKey = vertical ? "ArrowUp" : "ArrowLeft";

    function select(tab, focus) {
      triggers.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;                // roving tabindex
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.hidden = !on; }
      });
      if (focus !== false) { tab.focus({ preventScroll: true }); }
    }

    triggers.forEach(function (tab) {
      tab.addEventListener("click", function (e) { e.preventDefault(); select(tab); });
      tab.addEventListener("keydown", function (e) {
        var i = triggers.indexOf(tab), n = triggers.length, t = null;
        if (e.key === nextKey) { t = triggers[(i + 1) % n]; }
        else if (e.key === prevKey) { t = triggers[(i - 1 + n) % n]; }
        else if (e.key === "Home") { t = triggers[0]; }
        else if (e.key === "End") { t = triggers[n - 1]; }
        if (t) { e.preventDefault(); select(t); }
      });
    });

    var active = triggers.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
    select(active || triggers[0], false);        // sync DOM to the markup
  }

  /* ========================================================================
     ACCORDION
     ====================================================================== */

  function initAccordion(acc) {
    var single = acc.getAttribute("data-ui-accordion") !== "multiple";
    var items = $$("[data-ui-accordion-item]", acc);

    items.forEach(function (item) {
      var trigger = item.querySelector("[data-ui-accordion-trigger]");
      var content = item.querySelector("[data-ui-accordion-content]");
      if (!trigger || !content) { return; }
      if (!content.hasAttribute("role")) { content.setAttribute("role", "region"); }
      content.setAttribute("aria-labelledby", trigger.id || "");

      function setOpen(open) {
        trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          content.hidden = false;
          // Measure first, then hand the value to the CSS keyframe.
          content.style.setProperty("--ui-accordion-height", content.scrollHeight + "px");
          content.setAttribute("data-state", "open");
          afterAnim(content, function () {
            content.removeAttribute("data-state");
            content.style.removeProperty("--ui-accordion-height");
          });
        } else {
          content.style.setProperty("--ui-accordion-height", content.scrollHeight + "px");
          content.setAttribute("data-state", "closed");
          afterAnim(content, function () {
            content.hidden = true;
            content.removeAttribute("data-state");
            content.style.removeProperty("--ui-accordion-height");
          });
        }
      }

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        if (single && !isOpen) {
          items.forEach(function (other) {
            if (other === item) { return; }
            var t = other.querySelector("[data-ui-accordion-trigger]");
            if (t && t.getAttribute("aria-expanded") === "true") { t.click(); }
          });
        }
        setOpen(!isOpen);
      });

      // Keep the declared state and the DOM in sync on load.
      if (trigger.getAttribute("aria-expanded") === "true") { content.hidden = false; }
      else { content.hidden = true; }
    });
  }

  /* ========================================================================
     TOAST
     ====================================================================== */

  var viewport = null;

  function ensureViewport() {
    if (viewport && document.contains(viewport)) { return viewport; }
    viewport = document.querySelector("[data-ui-toast-viewport]");
    if (!viewport) {
      viewport = document.createElement("ol");
      viewport.setAttribute("data-ui-toast-viewport", "");
      viewport.className = "toast-viewport";
      document.body.appendChild(viewport);
    }
    return viewport;
  }

  var ICONS = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    destructive: '<i class="fa-solid fa-circle-exclamation"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>'
  };

  function dismissToast(li) {
    if (!li || li.getAttribute("data-state") === "closed") { return; }
    li.setAttribute("data-state", "closed");
    afterAnim(li, function () { if (li.parentNode) { li.parentNode.removeChild(li); } });
  }

  /**
   * UI.toast({ title, description, variant, duration, action })
   *   variant  "success" | "destructive" | "info" | "warning" | "default"
   *   duration ms, default 5000; pass 0 to keep it until dismissed
   *   action   { label, onClick } renders a button under the text
   */
  function toast(opts) {
    opts = opts || {};
    var vp = ensureViewport();
    var variant = opts.variant || "default";
    var duration = typeof opts.duration === "number" ? opts.duration : 5000;

    var li = document.createElement("li");
    li.className = "toast" + (variant !== "default" ? " toast-" + variant : "");
    li.setAttribute("role", variant === "destructive" ? "alert" : "status");
    li.setAttribute("aria-live", variant === "destructive" ? "assertive" : "polite");

    var icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.innerHTML = ICONS[variant] || ICONS.info;

    var body = document.createElement("div");
    body.className = "toast-body";
    if (opts.title) {
      var t = document.createElement("div");
      t.className = "toast-title";
      t.textContent = opts.title;
      body.appendChild(t);
    }
    if (opts.description) {
      var d = document.createElement("div");
      d.className = "toast-description";
      d.textContent = opts.description;
      body.appendChild(d);
    }
    if (opts.action && opts.action.label) {
      var a = document.createElement("button");
      a.type = "button";
      a.className = "btn btn-outline btn-sm toast-action";
      a.textContent = opts.action.label;
      a.addEventListener("click", function () {
        if (typeof opts.action.onClick === "function") { opts.action.onClick(); }
        dismissToast(li);
      });
      body.appendChild(a);
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "toast-close";
    close.setAttribute("aria-label", "Dismiss notification");
    close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    close.addEventListener("click", function () { dismissToast(li); });

    li.appendChild(icon); li.appendChild(body); li.appendChild(close);
    vp.appendChild(li);

    // Pause the countdown while the pointer is over it.
    if (duration > 0) {
      var remaining = duration, started = Date.now(), timer = null;
      var start = function () { started = Date.now(); timer = setTimeout(function () { dismissToast(li); }, remaining); };
      var pause = function () {
        if (!timer) { return; }
        clearTimeout(timer); timer = null;
        remaining -= (Date.now() - started);
      };
      li.addEventListener("mouseenter", pause);
      li.addEventListener("mouseleave", start);
      start();
    }
    return li;
  }

  /* ========================================================================
     COPY TO CLIPBOARD
     ====================================================================== */

  function copyText(text, sourceEl) {
    var done = function (ok) {
      if (!sourceEl) { return; }
      sourceEl.setAttribute("data-copied", ok ? "true" : "false");
      var label = sourceEl.querySelector("[data-ui-copy-label]");
      if (label) {
        if (!label.hasAttribute("data-original")) {
          label.setAttribute("data-original", label.textContent);
        }
        label.textContent = ok ? (label.getAttribute("data-copied-text") || "Copied")
                               : label.getAttribute("data-original");
        setTimeout(function () {
          sourceEl.removeAttribute("data-copied");
          label.textContent = label.getAttribute("data-original");
        }, 1600);
      }
      toast({
        title: ok ? "Copied to clipboard" : "Couldn't copy",
        description: ok ? (text.length > 48 ? text.slice(0, 48) + "…" : text) :
                          "Your browser blocked clipboard access.",
        variant: ok ? "success" : "destructive",
        duration: 2500
      });
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    // Insecure context (plain http:// on a LAN IP): fall back to a textarea.
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }

  /* ========================================================================
     INIT + GLOBAL DELEGATION
     ====================================================================== */

  function init(root) {
    root = root || document;

    $$("[data-ui-dropdown]", root).forEach(function (dd) {
      if (dd.__uiBound) { return; }
      var trigger = dd.querySelector("[data-ui-dropdown-trigger]");
      var content = dd.querySelector("[data-ui-dropdown-content], .dropdown-content, .popover-content");
      if (!trigger || !content) { return; }
      dd.__uiBound = true;
      dd.trigger = trigger; dd.content = content; dd.root = dd;
      content.hidden = true;
      initDropdown(dd);
    });

    $$("[data-ui-tabs]", root).forEach(function (t) {
      if (t.__uiBound) { return; }
      t.__uiBound = true; initTabs(t);
    });

    $$("[data-ui-accordion]", root).forEach(function (a) {
      if (a.__uiBound) { return; }
      a.__uiBound = true; initAccordion(a);
    });

    $$("[data-ui-dialog]", root).forEach(function (w) { w.hidden = true; });
  }

  function bindGlobal() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest ? e.target.closest("[data-ui-open]") : null;
      if (el) { e.preventDefault(); openDialog(el.getAttribute("data-ui-open"), el); return; }

      el = e.target.closest ? e.target.closest("[data-ui-close]") : null;
      if (el) {
        e.preventDefault();
        var id = el.getAttribute("data-ui-close");
        if (id) { closeDialog(id); }
        else if (openStack.length) { closeDialog(openStack[openStack.length - 1].id); }
        return;
      }

      el = e.target.closest ? e.target.closest("[data-ui-copy], [data-ui-copy-target]") : null;
      if (el) {
        e.preventDefault();
        var targetSel = el.getAttribute("data-ui-copy-target");
        var text = targetSel
          ? (document.querySelector(targetSel) || {}).textContent || ""
          : (el.getAttribute("data-ui-copy") || "");
        copyText(text.trim(), el);
        return;
      }

      // Click outside any open menu closes it.
      if (openDropdown) {
        var inside = openDropdown.root && openDropdown.root.contains(e.target);
        if (!inside) { closeMenu(openDropdown, false); }
      }
    });

    // Backdrop click closes the topmost dialog.
    document.addEventListener("click", function (e) {
      if (!openStack.length) { return; }
      var overlay = e.target.closest ? e.target.closest("[data-ui-dialog-overlay]") : null;
      if (overlay) { e.preventDefault(); closeDialog(openStack[openStack.length - 1].id); }
    });
  }

  var api = {
    toast: toast,
    dismissToast: dismissToast,
    openDialog: openDialog,
    closeDialog: closeDialog,
    closeMenu: function () { if (openDropdown) { closeMenu(openDropdown, false); } },
    copy: copyText,
    init: init
  };

  function boot() { init(document); bindGlobal(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.UI = api;
})();
