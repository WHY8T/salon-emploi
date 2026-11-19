/* hints.js: "Suivi" full-page overlay with 10 sealed envelopes. Click an unlocked one: the seal breaks,
   the flap opens, the letter slides out. Locked envelopes shake. */
(function () {
  var C = SE_CONFIG;
  var root = document.querySelector("[data-drawer-root]"), openBtn = document.querySelector("[data-open-hints]");
  if (!root || !openBtn) return;
  var drawer = root.querySelector(".drawer"), list = root.querySelector("[data-hint-list]"), head = root.querySelector(".drawer-head");
  var ca = root.querySelector(".curtain-a"), cb = root.querySelector(".curtain-b"), progress = root.querySelector("[data-progress]");
  var reader = root.querySelector("[data-reader]"), eb = reader.querySelector(".eb"), flap = reader.querySelector(".eb-flap");
  var paper = reader.querySelector(".eb-paper"), seal = reader.querySelector(".eb-seal");
  var inertEls = [document.querySelector(".site-header"), document.querySelector("main"), document.querySelector(".site-footer")];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var states = [], progressText = "", isOpen = false, readerOpen = false, lastFocus = null, envBtn = null, tl = null, rt = null, noteTimer = null;
  var pad = function (n) { return String(n + 1).padStart(2, "0"); };
  var animated = function () { return window.gsap && !reduce.matches; };

  /* Build the envelopes (re-run when the language changes) */
  function render() {
    var d = SE.t(), now = Date.now(), n = 0;
    list.innerHTML = C.hints.map(function (h, i) {
      var open = !!(h.unlocked || (h.unlockAt && now >= new Date(h.unlockAt).getTime()));
      states[i] = open; if (open) n++;
      return '<li class="hint" data-state="' + (open ? "unlocked" : "locked") + '"><button class="env" type="button" data-i="' + i + '" aria-label="' +
        SE.fmt(open ? d.envOpen : d.envLocked, { n: pad(i) }) + '"><span class="env-flap"></span><span class="env-pocket"></span>' +
        '<span class="env-num">' + pad(i) + '</span><svg class="icon env-ico" aria-hidden="true"><use href="#i-' + h.icon + '"/></svg>' +
        '<span class="env-seal"><svg class="icon" aria-hidden="true"><use href="#i-' + (open ? "unlock" : "lock") + '"/></svg></span></button></li>';
    }).join("");
    progressText = SE.fmt(d.progress, { n: n, t: C.hints.length });
    progress.textContent = progressText;
  }
  render(); document.addEventListener("se:lang", render);

  function setInert(v) { inertEls.forEach(function (el) { if (el) el.inert = v; }); }

  /* ---------- Overlay (curtain wipe) ---------- */
  function open() {
    if (isOpen) return;
    isOpen = true; lastFocus = document.activeElement;
    root.hidden = false; openBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("drawer-open"); setInert(true); drawer.scrollTop = 0;
    if (animated()) {
      if (tl) tl.kill();
      var items = list.children;
      gsap.set([ca, cb], { transformOrigin: "50% 100%" }); gsap.set([head, items], { opacity: 0 });
      tl = gsap.timeline()
        .fromTo(ca, { scaleY: 0 }, { scaleY: 1, duration: .85, ease: "expo.inOut" }, 0)
        .fromTo(cb, { scaleY: 0 }, { scaleY: 1, duration: .95, ease: "expo.inOut" }, .14)
        .fromTo(head, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out" }, .7)
        .fromTo(items, { y: 50, opacity: 0, rotation: function (i) { return i % 2 ? 2 : -2; } },
          { y: 0, opacity: 1, rotation: 0, duration: 1, ease: "expo.out", stagger: .07 }, .85);
    }
    root.querySelector(".drawer .icon-btn").focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; openBtn.setAttribute("aria-expanded", "false");
    function done() {
      root.hidden = true; document.documentElement.classList.remove("drawer-open"); setInert(false);
      if (window.gsap) gsap.set([ca, cb, head, list.children], { clearProps: "all" });
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    if (animated()) {
      if (tl) tl.kill();
      gsap.set([ca, cb], { transformOrigin: "50% 0%" });
      tl = gsap.timeline({ onComplete: done })
        .to([head, list.children], { y: -24, opacity: 0, duration: .4, ease: "power3.in", stagger: { each: .02, from: "end" } }, 0)
        .to(cb, { scaleY: 0, duration: .8, ease: "expo.inOut" }, .2)
        .to(ca, { scaleY: 0, duration: .8, ease: "expo.inOut" }, .32);
    } else done();
  }

  /* ---------- Envelope reader ---------- */
  function openReader(i, btn) {
    if (!states[i]) {                                           // sealed: shake + message
      if (window.gsap && !reduce.matches) gsap.to(btn, { keyframes: { x: [0, -8, 8, -5, 5, 0], easeEach: "power1.inOut" }, duration: .5 });
      progress.textContent = SE.t().lockedMsg; clearTimeout(noteTimer);
      noteTimer = setTimeout(function () { progress.textContent = progressText; }, 2400);
      return;
    }
    var h = SE.t().hints[i];
    paper.querySelector(".eb-num").textContent = pad(i);
    paper.querySelector("h3").innerHTML = SE.rich(h.title);
    paper.querySelector("p").textContent = h.text;
    envBtn = btn; readerOpen = true; reader.hidden = false; drawer.inert = true;
    if (animated()) {
      reader.classList.remove("static-open");
      if (rt) rt.kill();
      rt = gsap.timeline({ onReverseComplete: hideReader })
        .fromTo(reader, { opacity: 0 }, { opacity: 1, duration: .4, ease: "power2.out" }, 0)
        .fromTo(eb, { y: 70, opacity: 0, scale: .92 }, { y: 0, opacity: 1, scale: 1, duration: .9, ease: "expo.out" }, 0)
        .fromTo(seal, { scale: 1, opacity: 1, rotation: 0 }, { scale: .2, opacity: 0, rotation: -25, duration: .45, ease: "power3.in" }, .75)
        .fromTo(flap, { rotationX: 0, transformPerspective: 1200 }, { rotationX: -180, duration: .95, ease: "expo.inOut" }, .9)
        .set(flap, { zIndex: 1 }, 1.35)                                              // flap goes behind the letter once it is past vertical
        .fromTo(paper, { yPercent: 52 }, { yPercent: -35, duration: 1.15, ease: "expo.out" }, 1.4)
        .fromTo(paper.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out", stagger: .08 }, 1.75);
    } else reader.classList.add("static-open");                                     // reduced motion / no GSAP: show it already open
    reader.querySelector(".reader-close").focus({ preventScroll: true });
  }
  function hideReader() {
    reader.hidden = true; drawer.inert = false; readerOpen = false;
    if (window.gsap) gsap.set([reader, eb, flap, paper, seal, paper.children], { clearProps: "all" });
    if (envBtn) envBtn.focus({ preventScroll: true });
  }
  function closeReader() {
    if (!readerOpen) return;
    readerOpen = false;
    if (animated() && rt) rt.timeScale(1.8).reverse(); else hideReader();
  }

  openBtn.addEventListener("click", open);
  root.addEventListener("click", function (e) {
    var env = e.target.closest(".env");
    if (env) return openReader(+env.getAttribute("data-i"), env);
    if (e.target.closest("[data-reader-close]") || e.target === reader) return closeReader();
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); readerOpen ? closeReader() : close(); return; }
    if (e.key === "Tab") {                                                          // keep focus inside the active dialog
      var box = readerOpen ? reader : drawer;
      var f = box.querySelectorAll("button, a[href]"); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
