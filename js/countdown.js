/* countdown.js: rolling-digit countdown with before / live / after states */
(function () {
  var root = document.querySelector("[data-countdown]");
  if (!root) return;
  var cfg = SE_CONFIG.event;
  var start = new Date(cfg.start).getTime(), end = new Date(cfg.end).getTime();
  var units = [["days", 86400000], ["hours", 3600000], ["minutes", 60000], ["seconds", 1000]];
  var cols = {}, built = false, lastMinute = -1;
  var stateEl = root.querySelector("[data-state]"), srEl = root.querySelector("[data-sr]");


  /* A digit = clipped window over a strip: 9,8,...,0,9 (the extra 9 lets 0 -> 9 keep rolling the same way). */
  function build(daysCount) {
    units.forEach(function (u) {
      var n = u[0] === "days" ? Math.min(3, Math.max(2, daysCount)) : 2;
      var box = root.querySelector('[data-unit="' + u[0] + '"] .cd-digits');
      box.innerHTML = ""; cols[u[0]] = [];
      for (var i = 0; i < n; i++) {
        var d = document.createElement("span"); d.className = "digit";
        var s = document.createElement("span"); s.className = "strip";
        s.innerHTML = [9,8,7,6,5,4,3,2,1,0,9].map(function (k) { return "<i>" + k + "</i>"; }).join("");
        d.appendChild(s); box.appendChild(d); cols[u[0]].push({ s: s, cur: null });
      }
    });
    built = true;
  }

  function setDigit(o, v, instant) {
    if (v === o.cur) return;
    var wrap = !instant && o.cur === 0 && v === 9;           // 0 -> 9: roll onto the spare 9, then snap back
    if (instant || o.cur === null) o.s.style.transition = "none";
    o.s.style.setProperty("--i", wrap ? 10 : 9 - v);
    if (wrap) {
      o.s.addEventListener("transitionend", function () {
        o.s.style.transition = "none"; o.s.style.setProperty("--i", 0);
        void o.s.offsetWidth; o.s.style.transition = "";
      }, { once: true });
    } else if (instant || o.cur === null) { void o.s.offsetWidth; o.s.style.transition = ""; }
    o.cur = v;
  }

  function tick(instant) {
    var now = Date.now();
    var phase = now < start ? "before" : (now <= end ? "live" : "after");
    var left = Math.max(0, start - now), vals = {};
    units.forEach(function (u) { vals[u[0]] = Math.floor(left / u[1]); left -= vals[u[0]] * u[1]; });
    if (!built) build(String(vals.days).length);
    units.forEach(function (u) {
      var str = String(vals[u[0]]); var n = cols[u[0]].length;
      while (str.length < n) str = "0" + str;
      str = str.slice(-n);
      cols[u[0]].forEach(function (o, i) { setDigit(o, +str[i], instant); });
    });
    if (root.dataset.phase !== phase) {
      root.dataset.phase = phase;
      var x = SE.t(); stateEl.textContent = phase === "live" ? x.started : phase === "after" ? x.ended : "";
    }
    var minute = Math.floor(now / 60000);                     // update screen-reader text once a minute
    if (minute !== lastMinute) {
      lastMinute = minute;
      var y = SE.t(); srEl.textContent = phase === "before" ? vals.days + " " + y.days + ", " + vals.hours + " " + y.hours + ", " + vals.minutes + " " + y.minutes : stateEl.textContent;
    }
    return phase;
  }

  function loop() {
    var phase = tick(false);
    if (phase !== "after") setTimeout(loop, 1000 - (Date.now() % 1000) + 5);   // stay aligned to real seconds
  }
  document.addEventListener("se:lang", function () { root.dataset.phase = ""; lastMinute = -1; tick(true); });   // refresh texts
  document.addEventListener("visibilitychange", function () { if (!document.hidden) tick(true); });
  tick(true); setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
})();
