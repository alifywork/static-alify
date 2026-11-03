/* ==========================================================================
   hero.js - SECTION: hero entrance + gentle parallax
   Deliberately restrained: one staggered fade/slide on load, then two very
   small scrubbed parallax moves. Nothing loops or bounces.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    var hero = document.querySelector(".hero");
    if (!hero) { return; }
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduced) { return; }   // content is already visible without GSAP

    var tl = gsap.timeline({ defaults: { ease: "power3.out", duration: .8 } });

    tl.from(hero.querySelectorAll(".hero__badge, .hero__title, .hero__lead, .hero__ctas, .hero__stats"), {
      y: 26, opacity: 0, stagger: .09
    }, 0);

    tl.from(hero.querySelector(".hero__frame"), {
      y: 40, opacity: 0, duration: 1, ease: "power3.out"
    }, .25);

    tl.from(hero.querySelectorAll(".hero__float"), {
      scale: .85, opacity: 0, stagger: .12, duration: .6, ease: "back.out(1.6)"
    }, .7);

    // subtle scrubbed parallax: frame drifts down, floats drift up
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(hero.querySelector(".hero__frame"), {
        yPercent: 7, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
      gsap.to(hero.querySelectorAll(".hero__float"), {
        yPercent: -14, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
      gsap.to(hero.querySelector(".hero__bg"), {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
