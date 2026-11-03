/* ==========================================================================
   why-us.js - SECTION: why choose us
   Staggered entrance for the sticky intro and the reason cards.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    if (!window.Reveal) { return; }
    Reveal.items(".why-us", ".why-us__intro > *", { y: 22, stagger: .08 });
    Reveal.items(".why-us__grid", ".reason", { y: 28, stagger: .1 });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
