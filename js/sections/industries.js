/* ==========================================================================
   industries.js - SECTION: industries slider
   Carousel comes from the reusable slider component; this file adds the
   section entrance (head, then cards as they enter the viewport).
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    if (!window.Reveal) { return; }
    Reveal.items(".industries", ".industries .section-head, .industries .slider__foot", { y: 22 });
    Reveal.items(".industries .slider__viewport", ".industry-card", { y: 26, stagger: .07 });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
