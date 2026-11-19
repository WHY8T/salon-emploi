/* animations.js: intro sequence, idle motion (crow, eye, button). Animates transform + opacity only. */
(function () {
  window.SE = window.SE || {};
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Idle motion: crow parallax (pointer + scroll), eye breathing, magnetic button */
  function idle() {
    if (reduce) return;
    gsap.fromTo(".eye", { opacity: .06 }, { opacity: .4, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".ring-a", { rotation: 360, svgOrigin: "0 0", duration: 140, ease: "none", repeat: -1 });     // radar rings around the eye
    gsap.to(".ring-b", { rotation: -360, svgOrigin: "0 0", duration: 90, ease: "none", repeat: -1 });
    gsap.utils.toArray(".pulse").forEach(function (p, i) {                                                // pulses leaving the eye
      gsap.fromTo(p, { scale: .02, opacity: .6 }, { scale: 1, opacity: 0, duration: 5.5, ease: "power2.out", repeat: -1, delay: i * 2.75 });
    });
    feathers();
    gsap.to(".crow-scroll", { y: -14, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });   // slow drift (works on touch too)
    if (!finePointer) return;
    var cp = $(".crow-pointer");
    var qx = gsap.quickTo(cp, "x", { duration: 1.4, ease: "power3.out" });
    var qy = gsap.quickTo(cp, "y", { duration: 1.4, ease: "power3.out" });
    addEventListener("pointermove", function (e) {
      qx((e.clientX / innerWidth - .5) * -26); qy((e.clientY / innerHeight - .5) * -18);
    }, { passive: true });

    var b = $(".btn-suivi");                                   // magnetic hover
    var bx = gsap.quickTo(b, "x", { duration: .7, ease: "elastic.out(1,.6)" });
    var by = gsap.quickTo(b, "y", { duration: .7, ease: "elastic.out(1,.6)" });
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      bx((e.clientX - r.left - r.width / 2) * .3); by((e.clientY - r.top - r.height / 2) * .3);
    });
    b.addEventListener("pointerleave", function () { bx(0); by(0); });
  }

  /* Falling feathers: a few dark/bone/burgundy silhouettes drifting down behind the page */
  function feathers() {
    var box = $("[data-feathers]"), n = innerWidth < 700 ? 6 : 10, cols = ["rgba(236,230,220,.12)", "rgba(115,13,32,.55)", "rgba(236,230,220,.07)"];
    for (var i = 0; i < n; i++) {
      var el = document.createElement("span"), s = 18 + Math.random() * 30;
      el.className = "feather";
      el.style.cssText = "left:" + (Math.random() * 100) + "%;width:" + s + "px;color:" + cols[i % 3];
      el.innerHTML = '<svg viewBox="0 0 24 64"><path d="M12 2C21 14 22 36 12 62 2 36 3 14 12 2Z" fill="currentColor"/><path d="M12 8V60" stroke="#0d0b0b" stroke-width=".7"/></svg>';
      box.appendChild(el);
      var d = 18 + Math.random() * 14;
      gsap.timeline({ repeat: -1 }).progress(Math.random())
        .fromTo(el, { y: "-14vh", opacity: 0 }, { y: "112vh", duration: d, ease: "none" }, 0)
        .to(el, { opacity: 1, duration: d * .15 }, 0).to(el, { opacity: 0, duration: d * .15 }, d * .85);
      gsap.to(el, { x: "+=" + (40 + Math.random() * 50), rotation: (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 40),
        duration: 3 + Math.random() * 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }
  }

  /* Press feedback works on touch too */
  function press() {
    var b = $(".btn-suivi");
    var down = function () { gsap.to(b, { scale: .94, duration: .15, ease: "power3.out" }); };
    var up = function () { gsap.to(b, { scale: 1, duration: .5, ease: "power3.out" }); };
    b.addEventListener("pointerdown", down);
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { b.addEventListener(t, up); });
  }

  function start() {
    if (!window.gsap) { root.classList.add("no-anim", "ready"); return; }   // CDN failed: show static page
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    root.classList.add("ready");
    press();
    var words = gsap.utils.toArray(".letter .w"), sig = $(".letter-sign");

    if (reduce) {                                                 // reduced version: simple fades, no intro, no idle motion
      gsap.set(words, { opacity: 1 }); gsap.set(sig, { opacity: 1 });
      gsap.fromTo(".reveal", { opacity: 0 }, { opacity: 1, duration: .6, stagger: .12, ease: "power1.out" });
      return;
    }

    gsap.timeline({ onComplete: function () { var i = $(".intro"); if (i) i.remove(); root.classList.add("intro-done"); } })
      /* 1. logo drawn in (cover slides off) + rule */
      .to(".intro-cover", { scaleY: 0, duration: 1, ease: "expo.inOut" }, .1)
      .fromTo(".intro-rule", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "expo.inOut" }, .3)
      .to(".intro-logo", { y: -10, opacity: 0, duration: .45, ease: "power2.in" }, "+=.3")
      /* 2. burgundy panel wipes up */
      .to(".intro", { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, "<.05")
      /* 3. content rises, staggered */
      .fromTo(".site-header", { opacity: 0 }, { opacity: 1, duration: .9, ease: "power3.out" }, "-=.6")
      .fromTo(".countdown", { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, "<.1")
      .fromTo(".letter", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, "<.15")
      .fromTo(".letter-photo img", { scale: 1.12 }, { scale: 1, duration: 1.9, ease: "expo.out" }, "<.1")
      .fromTo(".bg-crow picture", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 2.2, ease: "expo.out" }, "<.2")
      .fromTo(".rings", { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: 2.6, ease: "expo.out" }, "<")
      /* 4. letter typed word by word, then signature */
      .to(words, { opacity: 1, duration: .25, ease: "none", stagger: .03 }, "<.5")
      .to(sig, { opacity: 1, duration: .9, ease: "power3.out" }, ">-.1")
      .add(idle, ">-1.5");
  }

  SE.animations = { start: start };
})();
