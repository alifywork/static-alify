/* ==========================================================================
   testimonials.js - SECTION: testimonials slider
   Autoplay is configured in the markup (data-slider). This file adds the
   entrance reveal and pauses autoplay while the section is off-screen so it
   doesn't advance through quotes nobody is watching.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    var section = document.querySelector(".testimonials");
    if (!section) { return; }

    if (window.Reveal) {
      Reveal.items(".testimonials", ".testimonials .section-head", { y: 22 });
      Reveal.items(".testimonials .slider__viewport", ".testimonial-card", { y: 24, stagger: .08 });
    }

    var sliderRoot = section.querySelector("[data-slider]");
    var inst = sliderRoot && window.Sliders
      ? window.Sliders.list.filter(function (s) { return s.root === sliderRoot; })[0]
      : null;
    if (!inst || !("IntersectionObserver" in window)) { return; }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { inst.start(); } else { inst.stop(); }
      });
    }, { threshold: .2 }).observe(section);
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
