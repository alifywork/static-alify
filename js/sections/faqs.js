/* ==========================================================================
   faqs.js - SECTION: FAQs
   - entrance reveal
   - deep linking: /#faq-<n> opens and scrolls to that question
   ========================================================================== */
(function () {
  "use strict";

  function openById(id) {
    var trigger = document.getElementById(id + "-t");
    if (!trigger) { return; }
    if (trigger.getAttribute("aria-expanded") !== "true") { trigger.click(); }
    setTimeout(function () {
      trigger.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }, 120);
  }

  function boot() {
    if (window.Reveal) {
      Reveal.items(".faqs", ".faqs__intro > *", { y: 22, stagger: .08 });
      Reveal.items(".faqs", ".faqs .accordion-item", { y: 18, stagger: .06 });
    }
    var hash = (location.hash || "").replace("#", "");
    if (/^faq-\d+$/.test(hash)) { openById(hash); }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
