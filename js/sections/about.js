/* ==========================================================================
   about.js - SECTION: about us
   Counts the [data-count] stats up once when they scroll into view.
   Plain rAF (no GSAP dependency for numbers) and reduced-motion aware:
   with reduced motion the final value is written instantly.
   ========================================================================== */
(function () {
  "use strict";

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-count-suffix") || "";
    var decimals = (el.getAttribute("data-count") || "").indexOf(".") > -1 ? 1 : 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }

    var dur = 1400, t0 = null;
    function frame(t) {
      if (t0 === null) { t0 = t; }
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    var nodes = document.querySelectorAll(".about [data-count]");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, countUp);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: .4 });
    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
