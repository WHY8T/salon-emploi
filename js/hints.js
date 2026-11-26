/* hints.js: "Suivi" full-page overlay with 10 envelopes. Click one: the envelope flies to the centre, the wax seal
   cracks, the flap opens, the folded letter slides out, comes forward and unfolds. Locked envelopes shake. */
(function () {
  var C = SE_CONFIG;
  var root = document.querySelector("[data-drawer-root]"), openBtn = document.querySelector("[data-open-hints]");
  if (!root || !openBtn) return;
  var drawer = root.querySelector(".drawer"), list = root.querySelector("[data-hint-list]"), head = root.querySelector(".drawer-head");
  var ca = root.querySelector(".curtain-a"), cb = root.querySelector(".curtain-b"), progress = root.querySelector("[data-progress]");
  var reader = root.querySelector("[data-reader]"), eb = reader.querySelector(".eb"), flap = reader.querySelector(".eb-flap");
  var paper = reader.querySelector(".eb-paper"), seal = reader.querySelector(".eb-seal");
  var back = reader.querySelector(".eb-back"), front = reader.querySelector(".eb-front");
  var panA = paper.querySelector(".pp-a"), panC = paper.querySelector(".pp-c");
  var ink = paper.querySelector(".eb-ink"), lshadow = paper.querySelector(".pp-shadow"), shards = [];
  var inertEls = [document.querySelector(".site-header"), document.querySelector("main"), document.querySelector(".site-footer")];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var states = [], progressText = "", isOpen = false, readerOpen = false, lastFocus = null, envBtn = null, tl = null, rt = null, noteTimer = null;
  var pad = function (n) { return String(n + 1).padStart(2, "0"); };
  var animated = function () { return window.gsap && !reduce.matches; };

  /* Build the envelopes, grouped by school (re-run when the language changes) */
  function envHtml(h, i, open, d) {
    return '<li class="hint" data-state="' + (open ? "unlocked" : "locked") + '"><button class="env" type="button" data-i="' + i + '" aria-label="' +
      SE.fmt(open ? d.envOpen : d.envLocked, { n: pad(i) }) + '"><img class="env-img" src="assets/envelope.webp" width="920" height="541" alt="" loading="lazy" decoding="async">' +
      '<span class="env-num">' + pad(i) + '</span><svg class="icon env-ico" aria-hidden="true"><use href="#i-' + h.icon + '"/></svg>' +
      (open ? "" : '<span class="env-seal"><svg class="icon" aria-hidden="true"><use href="#i-lock"/></svg></span>') + '</button></li>';
  }
  function render() {
    var d = SE.t(), now = Date.now(), n = 0;
    C.hints.forEach(function (h, i) {                       // open / sealed state of every hint
      var open = !!(h.unlocked || (h.unlockAt && now >= new Date(h.unlockAt).getTime()));
      states[i] = open; if (open) n++;
    });
    list.innerHTML = C.schools.map(function (s) {
      var idx = [];
      C.hints.forEach(function (h, i) { if (h.school === s.id) idx.push(i); });
      if (!idx.length) return "";
      var opened = idx.filter(function (i) { return states[i]; }).length;
      return '<li class="school"><div class="school-head"><h3 class="school-name">' + s.name + "</h3>" +
        (s.full ? '<p class="school-full">' + s.full + "</p>" : "") +
        '<p class="school-count" dir="ltr">' + opened + " / " + idx.length + "</p></div>" +
        '<ol class="school-grid" aria-label="' + s.name + '">' +
        idx.map(function (i) { return envHtml(C.hints[i], i, states[i], d); }).join("") + "</ol></li>";
    }).join("");
    progressText = SE.fmt(d.progress, { n: n, t: C.hints.length });
    progress.textContent = progressText;
  }
  /* Everything that staggers in: school headings + envelopes, in page order */
  function items() { return list.querySelectorAll(".school-head, .hint"); }
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
      var els = items();
      gsap.set([ca, cb], { transformOrigin: "50% 100%" }); gsap.set([head, els], { opacity: 0 });
      tl = gsap.timeline()
        .fromTo(ca, { scaleY: 0 }, { scaleY: 1, duration: .85, ease: "expo.inOut" }, 0)
        .fromTo(cb, { scaleY: 0 }, { scaleY: 1, duration: .95, ease: "expo.inOut" }, .14)
        .fromTo(head, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out" }, .7)
        .fromTo(els, { y: 50, opacity: 0, rotation: function (i) { return i % 2 ? 2 : -2; } },
          { y: 0, opacity: 1, rotation: 0, duration: 1, ease: "expo.out", stagger: .07 }, .85);
    }
    root.querySelector(".drawer .icon-btn").focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; openBtn.setAttribute("aria-expanded", "false");
    function done() {
      root.hidden = true; document.documentElement.classList.remove("drawer-open"); setInert(false);
      if (window.gsap) gsap.set([ca, cb, head, items()], { clearProps: "all" });
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    if (animated()) {
      if (tl) tl.kill();
      gsap.set([ca, cb], { transformOrigin: "50% 0%" });
      tl = gsap.timeline({ onComplete: done })
        .to([head, items()], { y: -24, opacity: 0, duration: .4, ease: "power3.in", stagger: { each: .02, from: "end" } }, 0)
        .to(cb, { scaleY: 0, duration: .8, ease: "expo.inOut" }, .2)
        .to(ca, { scaleY: 0, duration: .8, ease: "expo.inOut" }, .32);
    } else done();
  }

  /* ---------- Envelope reader ---------- */
  var BG0 = "rgba(5,4,4,0)", BG1 = "rgba(5,4,4,.92)", RATIO = 0.4 / 0.9;   // RATIO = panel height / panel width

  /* Size the letter for this screen and place it (folded) inside the envelope. Returns the geometry. */
  function layoutLetter() {
    var er = eb.getBoundingClientRect(), rr = reader.getBoundingClientRect();
    var w = eb.offsetWidth, H = eb.offsetHeight;
    var s = Math.min(rr.height * .86 / (w * 1.2), rr.width * .94 / (w * .9), 1.35);    // how much bigger the open letter is than the folded one
    var pw = w * .9 * s, ph = pw * RATIO, cy = H * .16 + w * .2;                        // folded letter centre sits inside the envelope
    paper.style.width = pw + "px"; paper.style.height = ph + "px";
    paper.style.left = (w - pw) / 2 + "px"; paper.style.top = (cy - ph / 2) + "px";
    ink.style.fontSize = Math.max(15, Math.min(22, pw * .046)) + "px"; ink.style.padding = pw * .09 + "px";
    return { w: w, H: H, s: s, er: er, rr: rr,
      toCentreX: rr.left + rr.width / 2 - (er.left + w / 2), toCentreY: rr.top + rr.height / 2 - (er.top + cy) };
  }

  /* A few flecks of red wax when the seal cracks */
  function addShards(tl, at, w) {
    for (var k = 0; k < 9; k++) {
      var el = document.createElement("span"), sz = 5 + Math.random() * 7, ang = (Math.PI * 2 * k) / 9 + Math.random() * .6, dist = w * (.12 + Math.random() * .16);
      el.className = "eb-shard"; el.style.width = sz + "px"; el.style.height = sz * (.6 + Math.random() * .6) + "px";
      el.style.clipPath = "polygon(" + [0, 1, 2, 3].map(function () { return (Math.random() * 100).toFixed(0) + "% " + (Math.random() * 100).toFixed(0) + "%"; }).join(",") + ")";
      eb.appendChild(el); shards.push(el);
      tl.set(el, { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 }, at)
        .to(el, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * .7 + w * .16, rotation: (Math.random() - .5) * 420, scale: .5, opacity: 0, duration: .85 + Math.random() * .3, ease: "power2.out" }, at);
    }
  }

  function openReader(i, btn) {
    if (!states[i]) {                                           // sealed: shake + message
      if (window.gsap && !reduce.matches) gsap.to(btn, { keyframes: { x: [0, -8, 8, -5, 5, 0], easeEach: "power1.inOut" }, duration: .5 });
      progress.textContent = SE.t().lockedMsg; clearTimeout(noteTimer);
      noteTimer = setTimeout(function () { progress.textContent = progressText; }, 2400);
      return;
    }
    var h = SE.t().hints[i], p = paper.querySelector("p");
    p.textContent = h.text; p.dir = "auto";
    envBtn = btn; readerOpen = true; reader.hidden = false; drawer.inert = true;
    var L = layoutLetter();

    if (animated()) {
      var br = btn.getBoundingClientRect(), s0 = br.width / L.w;                       // the envelope starts where the clicked one is
      var dx = br.left + br.width / 2 - (L.er.left + L.w / 2), dy = br.top + br.height / 2 - (L.er.top + L.H / 2);
      var lift = L.w * .56;                                                           // how far the letter rises to clear the envelope
      reader.classList.remove("static-open");
      if (rt) rt.kill();
      shards.forEach(function (n) { n.remove(); }); shards = [];

      gsap.set(reader, { backgroundColor: BG0 });
      gsap.set(eb, { x: dx, y: dy, scale: s0, opacity: 1, transformOrigin: "50% 50%" });
      gsap.set(paper, { transformPerspective: 1500, transformOrigin: "50% 50%", scale: 1 / L.s, x: 0, y: 0, rotation: 0, zIndex: 2 });
      gsap.set(panA, { rotationX: -180, z: 2 }); gsap.set(panC, { rotationX: 180, z: 1 });   // both folded onto the middle panel
      gsap.set([ink, lshadow], { opacity: 0 });
      gsap.set(flap, { rotationX: 0, transformPerspective: 1200, zIndex: 4 });
      gsap.set(seal, { scale: 1, opacity: 1, rotation: 0, y: 0 });
      gsap.set([back, front], { y: 0, opacity: 1 });
      btn.style.visibility = "hidden";

      rt = gsap.timeline()
        /* 1. the envelope you clicked flies to the middle while the room dims */
        .to(reader, { backgroundColor: BG1, duration: .7, ease: "power2.out" }, 0)
        .to(eb, { x: 0, y: 0, scale: 1, duration: .95, ease: "power3.inOut" }, 0)
        /* 2. the wax seal swells, then cracks and falls away */
        .to(seal, { scale: 1.07, duration: .2, ease: "power2.out" }, .85)
        .to(seal, { scale: .55, opacity: 0, rotation: -14, y: L.w * .03, duration: .55, ease: "power2.in" }, 1.05);
      addShards(rt, 1.08, L.w);
      rt
        /* 3. the flap lifts and folds back */
        .to(flap, { rotationX: -180, duration: 1.05, ease: "power2.inOut" }, 1.1)
        .set(flap, { zIndex: 1 }, 1.62)
        /* 4. the folded letter slides up out of the envelope, with a slight sway */
        .to(paper, { y: -lift, duration: 1.15, ease: "power2.out" }, 1.75)
        .to(paper, { rotation: -1.6, duration: .7, ease: "sine.inOut" }, 1.75)
        .set(paper, { zIndex: 6 }, 2.85)
        /* 5. it comes forward to the middle of the screen while the envelope drops away */
        .to(paper, { x: L.toCentreX, y: L.toCentreY, scale: 1, rotation: 0, duration: 1.05, ease: "power3.inOut" }, 3)
        .to([back, front, flap], { y: L.w * .25, opacity: 0, duration: .85, ease: "power2.in" }, 3.05)
        /* 6. it unfolds: top third falls open, then the bottom third */
        .to(panA, { rotationX: 0, z: 0, duration: .95, ease: "power2.inOut" }, 3.4)
        .to(panC, { rotationX: 0, z: 0, duration: .95, ease: "power2.inOut" }, 3.72)
        .to(lshadow, { opacity: 1, duration: .9, ease: "power1.out" }, 3.7)
        /* 7. the writing appears */
        .to(ink, { opacity: 1, duration: .8, ease: "power1.out" }, 4.3);
    } else {                                                    // reduced motion / no GSAP: show the finished letter, unfolded
      reader.classList.add("static-open");
      paper.style.transform = "translate(" + L.toCentreX + "px," + L.toCentreY + "px)";
    }
    reader.querySelector(".reader-close").focus({ preventScroll: true });
  }
  function hideReader() {
    reader.hidden = true; drawer.inert = false; readerOpen = false;
    shards.forEach(function (n) { n.remove(); }); shards = [];
    if (window.gsap) gsap.set([reader, eb, flap, paper, panA, panC, ink, lshadow, seal, back, front], { clearProps: "all" });
    paper.removeAttribute("style"); ink.removeAttribute("style");
    if (envBtn) { envBtn.style.visibility = ""; envBtn.focus({ preventScroll: true }); }
  }
  function closeReader() {
    if (!readerOpen) return;
    readerOpen = false;
    if (rt) rt.kill();
    if (animated()) {                                           // short and soft: the letter fades while the room brightens again
      rt = gsap.timeline({ onComplete: hideReader })
        .to(eb, { opacity: 0, y: 24, scale: .97, duration: .4, ease: "power2.in" }, 0)
        .to(reader, { backgroundColor: BG0, duration: .45, ease: "power2.out" }, .05);
    } else hideReader();
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
