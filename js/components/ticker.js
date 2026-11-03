/* ==========================================================================
   ticker.js - REUSABLE marquee setup
   --------------------------------------------------------------------------
   <div class="ticker" data-ticker='{"speed":70}'>
     <div class="ticker__track">
       <div class="ticker__group"> ...items... </div>
     </div>
   </div>

   speed = px per second (default 70). JS clones the single .ticker__group
   until the track is at least twice the viewport wide (the CSS loop slides
   -50%, so two identical halves are the minimum for a seamless seam), then
   sets --ticker-duration = (trackWidth/2) / speed so the visual speed is
   constant no matter how many items there are.
   ========================================================================== */
(function () {
  "use strict";

  function setup(root) {
    var cfg = {};
    try { cfg = JSON.parse(root.getAttribute("data-ticker") || "{}"); } catch (e) { cfg = {}; }
    var speed = cfg.speed || 70;
    var track = root.querySelector(".ticker__track");
    var group = root.querySelector(".ticker__group");
    if (!track || !group) { return; }

    // The CSS loop translates the track by -50%, which only lands on a group
    // seam when there is an EVEN number of identical groups. So: work out how
    // many copies are needed to cover 2x the viewport, force that to an even
    // number (minimum 2), and cap it so a tiny group can't explode the DOM.
    var vw = Math.max(root.offsetWidth, window.innerWidth);
    var groupWidth = group.getBoundingClientRect().width || group.offsetWidth || track.scrollWidth;
    var copies = groupWidth > 0 ? Math.ceil((vw * 2) / groupWidth) : 2;
    copies = Math.max(2, copies);
    if (copies % 2) { copies++; }
    copies = Math.min(copies, 12);
    for (var i = 1; i < copies; i++) { track.appendChild(group.cloneNode(true)); }
    // mark clones inert for assistive tech so items aren't announced twice
    Array.prototype.forEach.call(track.children, function (g, i) {
      if (i > 0) { g.setAttribute("aria-hidden", "true"); }
    });

    function size() {
      var half = track.scrollWidth / 2;
      root.style.setProperty("--ticker-duration", Math.max(8, half / speed) + "s");
    }
    size();
    window.addEventListener("resize", debounce(size, 200));
  }

  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function init(scope) {
    Array.prototype.forEach.call((scope || document).querySelectorAll("[data-ticker]"), function (r) {
      if (r.__ticker) { return; }
      r.__ticker = true;
      setup(r);
    });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { init(document); }); }
  else { init(document); }

  window.Tickers = { init: init };
})();
