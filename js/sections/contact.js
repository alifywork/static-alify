/* ==========================================================================
   contact.js - SECTION: contact form
   Client-side validation with aria-invalid + inline messages (the design
   system already styles [aria-invalid="true"]), a fake async submit that
   shows a loading button then a success toast, and a reset.
   ========================================================================== */
(function () {
  "use strict";

  function toast(o) { if (window.UI) { window.UI.toast(o); } }

  var RULES = {
    name:    function (v) { return v.trim().length >= 2 || "Please tell us your name."; },
    email:   function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) || "Enter a valid email address."; },
    company: function (v) { return v.trim().length >= 2 || "Company or project name, please."; },
    service: function (v) { return v !== "" || "Pick the service you need."; },
    message: function (v) { return v.trim().length >= 12 || "A sentence or two helps us route this correctly."; }
  };

  function validate(form) {
    var firstBad = null;
    Object.keys(RULES).forEach(function (key) {
      var field = form.elements[key];
      if (!field) { return; }
      var msgSlot = form.querySelector('[data-msg="' + key + '"]');
      var result = RULES[key](field.value);
      if (result === true) {
        field.removeAttribute("aria-invalid");
        if (msgSlot) { msgSlot.textContent = ""; msgSlot.removeAttribute("data-error"); }
      } else {
        field.setAttribute("aria-invalid", "true");
        if (msgSlot) { msgSlot.textContent = result; msgSlot.setAttribute("data-error", ""); }
        if (!firstBad) { firstBad = field; }
      }
    });
    return firstBad;
  }

  function boot() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) { return; }

    // clear a field's error as soon as the user fixes it
    form.addEventListener("input", function (e) {
      var key = e.target.name;
      if (!RULES[key]) { return; }
      if (RULES[key](e.target.value) === true) {
        e.target.removeAttribute("aria-invalid");
        var slot = form.querySelector('[data-msg="' + key + '"]');
        if (slot) { slot.textContent = ""; slot.removeAttribute("data-error"); }
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = validate(form);
      if (bad) {
        bad.focus();
        toast({ title: "Almost there", description: "A couple of fields need attention.", variant: "destructive" });
        return;
      }

      var btn = form.querySelector("[type='submit']");
      btn.classList.add("is-loading");
      btn.setAttribute("aria-busy", "true");
      btn.disabled = true;

      setTimeout(function () {
        btn.classList.remove("is-loading");
        btn.removeAttribute("aria-busy");
        btn.disabled = false;
        form.reset();
        toast({
          title: "Message received",
          description: "We reply within one business day. (Demo — nothing was sent.)",
          variant: "success"
        });
      }, 1200);
    });

    if (window.Reveal) {
      Reveal.items(".contact", ".contact__info > *", { y: 22, stagger: .08 });
      Reveal.items(".contact", ".contact__form-card", { y: 28 });
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
