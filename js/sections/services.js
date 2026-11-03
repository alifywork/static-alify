/* ==========================================================================
   services.js - SECTION: services slider
   The carousel engine is the reusable slider component (auto-init from
   data-slider). This file handles the section's own entrance: the head and
   each visible card fade/slide in once, staggered.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    if (!window.Reveal) { return; }
    // .services__head is the outer row (title block + CTA); target it, not the
    // nested .section-head inside it, so children aren't double-animated
    Reveal.items(".services", ".services__head, .services .slider__foot", { y: 22 });
    Reveal.items(".services .slider__viewport", ".service-card", { y: 26, stagger: .08 });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
