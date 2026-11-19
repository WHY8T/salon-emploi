/* i18n.js: language handling (fr / en / ar), RTL, *red word* markup, and the letter markup */
(function () {
  var C = SE_CONFIG, root = document.documentElement, lang = C.defaultLang;
  window.SE = window.SE || {};
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* "*word*" -> red italic word */
  function rich(s) { return s.replace(/\*(.+?)\*/g, '<em class="hl">$1</em>'); }
  /* Splits text into word spans (for the typed reveal); words inside *stars* get the .hl class */
  function words(s) {
    var on = false;
    return s.split(" ").map(function (w) {
      if (w.charAt(0) === "*") on = true;
      var cls = "w" + (on ? " hl" : "");
      if (w.slice(-1) === "*") on = false;
      return '<span class="' + cls + '">' + w.replace(/^\*|\*$/g, "") + "</span>";
    }).join(" ");
  }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function t() { return C.i18n[lang]; }

  function detect() {
    var q = new URLSearchParams(location.search).get("lang"), saved = null;
    try { saved = localStorage.getItem("se-lang"); } catch (e) {}
    var nav = (navigator.language || "").slice(0, 2);
    return [q, saved, nav].filter(function (l) { return l && C.i18n[l]; })[0] || C.defaultLang;
  }

  function buildLetter() {
    var L = t().letter;
    document.querySelector("[data-letter]").innerHTML =
      '<p class="letter-greet">' + words(L.greeting) + "</p>" +
      L.paragraphs.map(function (p) { return "<p>" + words(p) + "</p>"; }).join("") +
      '<p class="letter-sign"><span>' + L.signature + "</span><small>" + L.role + "</small></p>";
  }

  function apply() {
    var d = t();
    root.lang = lang; root.dir = d.dir || "ltr";
    document.title = d.metaTitle;
    var m = document.querySelector('meta[name="description"]'); if (m) m.content = d.metaDesc;
    $$("[data-i18n]").forEach(function (el) { el.innerHTML = rich(d[el.getAttribute("data-i18n")] || ""); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", d[el.getAttribute("data-i18n-aria")]); });
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    buildLetter();
    document.dispatchEvent(new CustomEvent("se:lang"));
  }

  function set(l) {
    if (l === lang || !C.i18n[l]) return;
    lang = l; try { localStorage.setItem("se-lang", l); } catch (e) {}
    apply();
    if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo([".cd-title", ".cd-meta", ".letter-body"], { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: .7, stagger: .08, ease: "power3.out", clearProps: "transform,opacity" });
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]"); if (b) set(b.getAttribute("data-lang"));
  });
  SE.t = t; SE.rich = rich; SE.fmt = fmt; SE.setLang = set;
  lang = detect(); apply();
})();
