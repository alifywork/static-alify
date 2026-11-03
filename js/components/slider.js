/* ==========================================================================
   slider.js - REUSABLE carousel engine
   --------------------------------------------------------------------------
   <div class="slider" data-slider='{"perView":{"base":1.1,"md":2,"lg":3},
        "gap":24,"loop":true,"autoplay":6000}'>

   perView  slides visible per breakpoint (base, sm, md, lg, xl) - fractional
            values like 1.15 give a "peek" of the next card on mobile
   gap      px between slides
   loop     wrap around at the ends (default true)
   autoplay ms between advances; 0 disables. Pauses on hover, focus, drag and
            when the tab is hidden; never runs under prefers-reduced-motion.

   Controls inside the .slider are found by attribute:
     [data-slider-prev] [data-slider-next] [data-slider-current] [data-slider-total]
   A .slider__meter-fill, if present, reflects position.
   Exposes window.Sliders (list) and auto-inits every [data-slider] on load;
   call Sliders.init(root) after injecting markup.
   ========================================================================== */
(function () {
  "use strict";

  var BPS = [["xl", 1200], ["lg", 992], ["md", 768], ["sm", 576]];
  var instances = [];
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function perViewFor(cfg) {
    var pv = cfg.perView || {};
    var w = window.innerWidth;
    for (var i = 0; i < BPS.length; i++) {
      if (w >= BPS[i][1] && pv[BPS[i][0]] != null) { return pv[BPS[i][0]]; }
    }
    return pv.base != null ? pv.base : 1;
  }

  function make(root) {
    var cfg = {};
    try { cfg = JSON.parse(root.getAttribute("data-slider") || "{}"); } catch (e) { cfg = {}; }
    if (cfg.loop == null) { cfg.loop = true; }

    var viewport = root.querySelector(".slider__viewport");
    var track = root.querySelector(".slider__track");
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector("[data-slider-prev]");
    var next = root.querySelector("[data-slider-next]");
    var cur = root.querySelector("[data-slider-current]");
    var tot = root.querySelector("[data-slider-total]");
    var meter = root.querySelector(".slider__meter-fill");

    var s = {
      root: root, cfg: cfg, viewport: viewport, track: track, slides: slides,
      index: 0, perView: 1, gap: cfg.gap != null ? cfg.gap : 24,
      timer: null, dragging: false
    };

    function maxIndex() { return Math.max(0, slides.length - Math.ceil(s.perView)); }

    function applyVars() {
      root.style.setProperty("--slider-per", s.perView);
      root.style.setProperty("--slider-gap", s.gap + "px");
    }

    function slideStep() {
      if (!slides.length) { return 0; }
      return slides[0].getBoundingClientRect().width + s.gap;
    }

    function render(instant) {
      if (instant) { track.classList.add("is-instant"); }
      var x = -(s.index * slideStep());
      track.style.transform = "translate3d(" + x + "px,0,0)";
      if (instant) {
        // force reflow then restore transitions
        void track.offsetWidth;
        track.classList.remove("is-instant");
      }
      var mi = maxIndex();
      if (prev) { prev.disabled = !s.cfg.loop && s.index <= 0; }
      if (next) { next.disabled = !s.cfg.loop && s.index >= mi; }
      if (cur) { cur.textContent = String(Math.min(s.index + 1, slides.length)); }
      if (tot) { tot.textContent = String(slides.length); }
      if (meter) {
        // fill spans the visible window; slide it across the meter as index moves
        var frac = Math.min(1, s.perView / slides.length);
        var travel = Math.max(0, slides.length - Math.ceil(s.perView));
        var progress = travel ? (s.index / travel) : 0;
        meter.style.width = (frac * 100) + "%";
        // translateX is relative to the fill's own width:
        // total travel in fill-widths = (1 - frac) / frac
        meter.style.transform = "translateX(" + (progress * (1 - frac) / frac * 100) + "%)";
      }
    }

    function go(i, instant) {
      var mi = maxIndex();
      if (s.cfg.loop) {
        if (i < 0) { i = mi; }
        else if (i > mi) { i = 0; }
      } else {
        i = Math.max(0, Math.min(mi, i));
      }
      s.index = i;
      render(instant);
    }

    function stop() { if (s.timer) { clearInterval(s.timer); s.timer = null; } }
    function start() {
      stop();
      if (!s.cfg.autoplay || reduced.matches || slides.length <= Math.ceil(s.perView)) { return; }
      s.timer = setInterval(function () { go(s.index + 1); }, s.cfg.autoplay);
    }

    /* --- events --- */
    if (prev) { prev.addEventListener("click", function () { go(s.index - 1); start(); }); }
    if (next) { next.addEventListener("click", function () { go(s.index + 1); start(); }); }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    viewport.setAttribute("tabindex", "0");
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-roledescription", "carousel");
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(s.index - 1); start(); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(s.index + 1); start(); }
    });

    /* pointer drag: nudge to prev/next on a decisive horizontal swipe */
    var startX = 0, startY = 0, dx = 0, active = false, locked = false;
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) { return; }
      active = true; locked = false; startX = e.clientX; startY = e.clientY; dx = 0;
      stop();
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!active) { return; }
      dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!locked && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        locked = true;
        viewport.classList.add("is-dragging");
        track.classList.add("is-instant");
      }
      if (locked) {
        track.style.transform = "translate3d(" + (-(s.index * slideStep()) + dx) + "px,0,0)";
      }
    });
    function endDrag() {
      if (!active) { return; }
      active = false;
      viewport.classList.remove("is-dragging");
      track.classList.remove("is-instant");
      var threshold = Math.min(90, viewport.offsetWidth * .18);
      if (locked) {
        if (dx <= -threshold) { go(s.index + 1); }
        else if (dx >= threshold) { go(s.index - 1); }
        else { render(); }
      }
      locked = false; dx = 0;
      start();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", function () { if (active && locked) { endDrag(); } });

    /* prevent a drag from also firing a click on inner links */
    viewport.addEventListener("click", function (e) {
      if (Math.abs(dx) > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    function relayout() {
      var pv = perViewFor(cfg);
      var changed = pv !== s.perView;
      s.perView = pv;
      applyVars();
      if (s.index > maxIndex()) { s.index = maxIndex(); }
      render(changed);
      start();
    }

    s.go = go; s.relayout = relayout; s.start = start; s.stop = stop;
    relayout();
    return s;
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { instances.forEach(function (s) { s.relayout(); }); }, 120);
  });

  function init(scope) {
    var roots = (scope || document).querySelectorAll("[data-slider]");
    Array.prototype.forEach.call(roots, function (r) {
      if (r.__slider) { return; }
      r.__slider = true;
      instances.push(make(r));
    });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { init(document); }); }
  else { init(document); }

  window.Sliders = { list: instances, init: init };
})();
