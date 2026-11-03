/* ==========================================================================
   projects.js - SECTION: expanding project panels
   Owns the .is-open state so mouse, touch and keyboard all behave the same:
     - pointer devices: hovering a panel opens it (and closes the rest)
     - click / tap / Enter / Space: opens (or pins) a panel
   Starts with the first panel open so the row never looks empty.
   ========================================================================== */
(function () {
  "use strict";

  function boot() {
    var grid = document.querySelector(".projects__grid");
    if (!grid) { return; }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".project"));
    if (!cards.length) { return; }

    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function open(i) {
      cards.forEach(function (c, n) {
        var on = n === i;
        c.classList.toggle("is-open", on);
        c.setAttribute("aria-expanded", String(on));
      });
    }

    cards.forEach(function (card, i) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", "false");

      if (fine) {
        card.addEventListener("mouseenter", function () { open(i); });
      }
      card.addEventListener("click", function () { open(i); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
        if (e.key === "ArrowRight" && cards[i + 1]) { cards[i + 1].focus(); }
        if (e.key === "ArrowLeft" && cards[i - 1]) { cards[i - 1].focus(); }
      });
    });

    open(0);

    if (window.Reveal) {
      Reveal.items(".projects", ".projects .section-head", { y: 22 });
      Reveal.items(".projects", ".projects__grid", { y: 30 });
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
