/* ==========================================================================
   footer.js - GLOBAL footer behaviour
   - stamps the current year
   - back-to-top with a smooth, reduced-motion-aware scroll
   - newsletter form: validates, shows a toast, never actually posts
   ========================================================================== */
(function () {
  "use strict";

  function toast(opts) { if (window.UI) { window.UI.toast(opts); } }

  function boot() {
    var years = document.querySelectorAll("[data-footer-year]");
    Array.prototype.forEach.call(years, function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    var top = document.querySelector("[data-footer-top]");
    if (top) {
      top.addEventListener("click", function (e) {
        e.preventDefault();
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      });
    }

    var form = document.querySelector("[data-footer-news]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var val = (input && input.value || "").trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
          if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
          toast({ title: "Check your email", description: "That address doesn't look right.", variant: "destructive" });
          return;
        }
        if (input) { input.removeAttribute("aria-invalid"); }
        form.reset();
        toast({ title: "You're on the list", description: "One email a month, no spam. (Demo — nothing was sent.)", variant: "success" });
      });
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
