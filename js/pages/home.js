/* ==========================================================================
   home.js - PAGE: home
   Defines the shared reveal helper every section script uses:

     Reveal.items(containerSelector, itemSelector, { y, stagger, duration })

   Elements marked [data-reveal] in the markup are hidden by base.css only
   while <html> carries the .js class (added inline in <head>), so:
     - with JS + GSAP: they fade/slide in once, on scroll
     - without GSAP, or with prefers-reduced-motion: they're shown instantly
   Section files call this; nothing here is section-specific.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var hasGsap = function () { return !!window.gsap; };

  function ensurePlugin() {
    if (window.gsap && window.ScrollTrigger && !ensurePlugin.done) {
      gsap.registerPlugin(ScrollTrigger);
      ensurePlugin.done = true;
    }
  }

  function showNow(el) {
    el.style.opacity = "1";
    el.style.transform = "none";
  }

  function items(containerSel, itemSel, opts) {
    opts = opts || {};
    var container = typeof containerSel === "string" ? document.querySelector(containerSel) : containerSel;
    if (!container) { return; }
    var els = Array.prototype.slice.call(container.querySelectorAll(itemSel));
    if (!els.length) { return; }

    if (!hasGsap() || reduced.matches) {
      els.forEach(showNow);
      return;
    }
    ensurePlugin();

    gsap.fromTo(els,
      { opacity: 0, y: opts.y != null ? opts.y : 24 },
      {
        opacity: 1, y: 0,
        duration: opts.duration != null ? opts.duration : .7,
        ease: "power3.out",
        stagger: opts.stagger != null ? opts.stagger : 0,
        scrollTrigger: { trigger: container, start: opts.start || "top 86%", once: true }
      });
  }

  function single(sel, opts) { items(document, sel, opts); }

  /* Reveal every [data-reveal] element with its own scroll trigger, so markup
     can opt in declaratively without each section script knowing about it.
     Sections still call Reveal.items() for their own card grids. */
  function auto() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) { return; }
    if (!hasGsap() || reduced.matches) { els.forEach(showNow); return; }
    ensurePlugin();
    els.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: .75, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });
  }

  window.Reveal = { items: items, single: single, auto: auto };

  function boot() { auto(); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }

  // safety net: if GSAP failed to load, un-hide anything the CSS had hidden
  window.addEventListener("load", function () {
    if (hasGsap() && !reduced.matches) { return; }
    Array.prototype.forEach.call(document.querySelectorAll("[data-reveal]"), showNow);
  });
})();
