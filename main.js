(function () {
  "use strict";
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- splash ---------- */
  var splash = document.getElementById("splash");
  function closeSplash() {
    if (!splash || splash.classList.contains("hidden")) return;
    splash.classList.add("hidden"); body.classList.remove("splash-on"); document.documentElement.classList.remove("splash-lock");
    startHero();
    setTimeout(function () { splash.setAttribute("hidden", ""); }, 850);
  }
  if (splash) {
    window.scrollTo(0, 0);
    ["wheel", "touchmove"].forEach(function (ev) {
      window.addEventListener(ev, function (e) { if (!splash.classList.contains("hidden")) e.preventDefault(); }, { passive: false });
    });
    document.addEventListener("keydown", function (e) {
      if (!splash.classList.contains("hidden") && ["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"].indexOf(e.key) > -1) e.preventDefault();
    });
    document.getElementById("splashBtn").addEventListener("click", closeSplash);
    document.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === "Escape") closeSplash(); });
    setTimeout(function () { document.getElementById("splashBtn").focus({ preventScroll: true }); }, 1100);
  }

  /* ---------- header al scrollear ---------- */
  function onScroll() { body.classList.toggle("scrolled", window.scrollY > 60); updateFloats(); }

  /* ---------- menú mobile ---------- */
  var burger = document.getElementById("burger");
  function closeMenu() { body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () {
    var open = !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open); burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("moverlay").addEventListener("click", closeMenu);
  document.querySelectorAll("#mnav a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---------- boceto: páginas internas todavía no construidas ---------- */
  document.addEventListener("click", function (e) {
    var l = e.target.closest('a[href="#"]'); if (l) e.preventDefault();
  });

  /* ---------- reveals + contadores ---------- */
  var heroEls = document.querySelectorAll("#hero .reveal,#hero .reveal-left,#hero .reveal-right");
  var revealEls = Array.prototype.filter.call(document.querySelectorAll(".reveal,.reveal-left,.reveal-right"), function (el) { return !el.closest("#hero"); });
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    heroEls.forEach(function (el) { el.classList.add("in"); });
    if (!reduce) document.querySelectorAll("#hero .count").forEach(function (el) { countUp(el); });
  }
  function countUp(el) {
    var target = +el.dataset.target, cur = 0, step = target / (1300 / 16);
    var t = setInterval(function () { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = Math.floor(cur); }, 16);
  }
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll(".count").forEach(function (el) { el.textContent = "0"; if (!el.closest("#hero")) cio.observe(el); });
  }

  /* ---------- flotantes: se ocultan al llegar al footer ---------- */
  var waFloat = document.getElementById("waFloat"), backToTop = document.getElementById("backToTop");
  var footerVisible = false;
  function updateFloats() {
    var show = window.scrollY > 500 && !footerVisible;
    waFloat.classList.toggle("show", show); backToTop.classList.toggle("show", show);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { footerVisible = en.isIntersecting; }); updateFloats();
    }, { threshold: 0 }).observe(document.querySelector("footer.site"));
  }
  backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- formulario (FormSubmit + modal) ---------- */
  var form = document.getElementById("contactForm"), btn = document.getElementById("formSubmitBtn");
  var iframe = document.getElementById("formsubmit-iframe"), modal = document.getElementById("okModal"), sending = false;
  function validField(input) {
    var v = input.value.trim();
    var ok = v !== "" && (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    input.closest(".field").classList.toggle("err", !ok); return ok;
  }
  form.addEventListener("submit", function (e) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (i) { if (!validField(i)) ok = false; });
    if (!ok) { e.preventDefault(); var f = form.querySelector(".field.err input,.field.err textarea"); if (f) f.focus(); return; }
    sending = true; btn.disabled = true; btn.textContent = "Enviando...";
  });
  form.querySelectorAll("[required]").forEach(function (i) {
    i.addEventListener("input", function () { if (i.closest(".field").classList.contains("err")) validField(i); });
  });
  iframe.addEventListener("load", function () {
    if (!sending) return;
    sending = false; form.reset(); btn.disabled = false; btn.textContent = "Enviar";
    modal.classList.add("show");
  });
  function closeModal() { modal.classList.remove("show"); }
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeModal(); } });

  document.getElementById("year").textContent = new Date().getFullYear();
  if (!splash) { startHero(); document.documentElement.classList.remove("splash-lock"); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
