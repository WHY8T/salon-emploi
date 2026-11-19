/* main.js: builds the letter from config, waits for fonts + crow, then starts the intro */
(function () {
  var img = document.querySelector(".crow img");
  var imgReady = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var cap = new Promise(function (r) { setTimeout(r, 2500); });   // never wait more than 2.5 s
  Promise.race([Promise.all([fontsReady, imgReady]), cap]).then(SE.animations.start);
})();
