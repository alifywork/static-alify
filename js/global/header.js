/* ==========================================================================
   header.js - GLOBAL header behaviour
   --------------------------------------------------------------------------
   - condenses the header on scroll (.is-scrolled)
   - drives the thin scroll-progress hairline
   - marks the nav link for the section currently in view (aria-current)
   - closes any open drawer when the viewport grows past the desktop breakpoint
   Theme switching and the drawers themselves live in theme.js / drawer.js.
   ========================================================================== */
(function () {
  "use strict";

  var header, fill, links, sections, ticking = false;

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", y > 8);

      if (fill) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, y / max) : 0;
        fill.style.width = (p * 100).toFixed(2) + "%";
      }
      highlight(y);
    });
  }

  // choose the section whose top is nearest just under the header
  function highlight(y) {
    if (!links || !sections || !sections.length) { return; }
    var offset = (window.innerHeight * 0.35);
    var currentId = null;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= offset && r.bottom > offset) { currentId = sections[i].id; break; }
    }
    if (!currentId && y < 200) { currentId = null; }   // at the very top: nothing active
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var on = currentId && href === "#" + currentId;
      if (on) { a.setAttribute("aria-current", "true"); } else { a.removeAttribute("aria-current"); }
    });
  }

  function boot() {
    header = document.getElementById("site-header");
    if (!header) { return; }
    fill = header.querySelector(".site-header__progress-fill");
    links = Array.prototype.slice.call(header.querySelectorAll('.site-nav__link[href^="#"]'));
    sections = links
      .map(function (a) { return document.getElementById((a.getAttribute("href") || "").slice(1)); })
      .filter(Boolean);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      onScroll();
      if (window.innerWidth >= 992 && window.Drawer) { window.Drawer.closeAll(); }
    });
    onScroll();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
