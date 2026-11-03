/* ==========================================================================
   tech.js - SECTION: technology ticker
   The marquee itself is the reusable ticker component; this file only
   pauses it while the band is off-screen so an infinite CSS animation isn't
   burning frames nobody can see.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    var section = document.querySelector(".tech");
    var track = section && section.querySelector(".ticker__track");
    if (!section || !track || !("IntersectionObserver" in window)) { return; }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        track.classList.toggle("is-paused", !en.isIntersecting);
      });
    }, { threshold: 0 }).observe(section);
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
