// Hero demo: a loop is dragged out of Hertz Sync and dropped on a DAW timeline, where it lands
// in the project's tempo and key. Change the tempo or key and the drag plays again.
(function () {
  var rig = document.getElementById('rig');
  if (!rig) return;
  var el = function (id) { return document.getElementById(id); };
  var loop = el('loop-main'), lane = el('lane-keys'), placed = el('placed'), ghost = el('ghost'), cursor = el('cursor');
  var snaps = rig.querySelectorAll('.snap');
  var ORIG_BPM = 98, ORIG_ROOT = 6; // the demo loop: 98 BPM, F-sharp minor
  var KEYS = [['Am', 'A minor', 9], ['Cm', 'C minor', 0], ['Dm', 'D minor', 2]];
  var bpm = 120, key = KEYS[0], mode = 'synced';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = true, anims = [], timer = null, TOTAL = 7600, cycles = 0;

  function heights(n, seed) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var accent = i % 8 === 0;
      out.push(accent ? .95 : .22 + .36 * Math.abs(Math.sin(i * 1.7 + seed)) + (i % 2 === 0 ? .08 : 0));
    }
    return out;
  }
  function stops() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? [[85, 104, 224], [143, 92, 240]]
      : [[143, 168, 255], [197, 140, 255]];
  }
  function colour(t) {
    var s = stops(), x = t * (s.length - 1), a = Math.min(Math.floor(x), s.length - 2), f = x - a;
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(s[a][k] + (s[a + 1][k] - s[a][k]) * f); }).join(',') + ')';
  }
  function fill(box, n, seed, spectrum) {
    box.textContent = '';
    heights(n, seed).forEach(function (h, i) {
      var b = document.createElement('b');
      b.style.height = Math.round(h * 100) + '%';
      if (spectrum) b.style.background = colour(i / (n - 1));
      box.appendChild(b);
    });
  }
  function build() {
    Array.prototype.forEach.call(rig.querySelectorAll('.loop .mini'), function (m, i) { fill(m, 22, i * 2.1, false); });
    fill(rig.querySelector('.placed-bars'), 36, 0, true);
    fill(rig.querySelector('.ghost-bars'), 14, 0, true);
  }
  function words() {
    var d = key[2] - ORIG_ROOT, shift = (((d + 6) % 12) + 12) % 12 - 6;
    var tempo = '×' + (bpm / ORIG_BPM).toFixed(2) + ' tempo';
    var pitch = shift === 0 ? 'already in key' : (shift > 0 ? '+' : '−') + Math.abs(shift) + ' semitones';
    el('rig-bpm').textContent = bpm;
    el('rig-now').textContent = bpm + ' BPM · ' + key[1];
    el('rig-say').textContent = mode === 'raw' ? 'plays as recorded: off your grid and out of key' : tempo + ' · ' + pitch;
    placed.style.width = mode === 'raw' ? (25 * bpm / ORIG_BPM) + '%' : '25%';
    rig.classList.toggle('is-raw', mode === 'raw');
    rig.querySelector('.ghost-text small').textContent = bpm + ' BPM · ' + key[1];
    placed.querySelector('em').textContent = mode === 'raw' ? ORIG_BPM + ' BPM · F♯ minor' : '✓ ' + bpm + ' BPM · ' + key[1];
    rig.querySelector('.ghost-text small').textContent = mode === 'raw' ? ORIG_BPM + ' BPM · F♯ minor' : bpm + ' BPM · ' + key[1];
    Array.prototype.forEach.call(rig.querySelectorAll('.rig-key'), function (b) { b.setAttribute('aria-pressed', b.dataset.k === key[0] ? 'true' : 'false'); });
  }

  // The page opens at 110% (CSS zoom): rectangles are measured on screen, positions are set in page units.
  function zoom() { var z = parseFloat(getComputedStyle(document.documentElement).zoom); return z > 0 ? z : 1; }
  function rel(node) {
    var r = node.getBoundingClientRect(), o = rig.getBoundingClientRect(), z = zoom();
    return { x: (r.left - o.left) / z, y: (r.top - o.top) / z, w: r.width / z, h: r.height / z };
  }
  function stop() {
    clearTimeout(timer);
    anims.forEach(function (a) { a.cancel(); });
    anims = [];
    loop.classList.remove('is-picked');
  }
  function still() {
    // Reduced motion, or no Web Animations: show the result, not the journey.
    stop();
    placed.style.opacity = 1;
  }
  function run() {
    stop();
    if (reduce || !loop.animate) { still(); return; }
    placed.style.opacity = '';
    cycles++;
    var src = rel(loop), dst = rel(placed), box = rig.getBoundingClientRect();
    var grab = { x: 90, y: 24 };
    var P0 = { x: box.width / zoom() - 36, y: box.height / zoom() - 46 };
    var P1 = { x: src.x + 90, y: src.y + src.h / 2 };
    var P2 = { x: dst.x + dst.w * .55, y: dst.y + dst.h / 2 };
    var at = function (p) { return 'translate(' + p.x + 'px,' + p.y + 'px)'; };
    var atG = function (p, s) { return 'translate(' + (p.x - grab.x) + 'px,' + (p.y - grab.y) + 'px) scale(' + s + ')'; };
    var o = { duration: TOTAL, fill: 'both', easing: 'cubic-bezier(.45,.05,.25,1)' };
    var lin = { duration: TOTAL, fill: 'both' };
    anims.push(cursor.animate([
      { offset: 0, transform: at(P0), opacity: 0 },
      { offset: .08, transform: at(P0), opacity: 1 },
      { offset: .27, transform: at(P1), opacity: 1 },
      { offset: .32, transform: at(P1) + ' scale(.86)', opacity: 1 },
      { offset: .63, transform: at(P2) + ' scale(.86)', opacity: 1 },
      { offset: .68, transform: at(P2), opacity: 1 },
      { offset: .88, transform: at(P2), opacity: 1 },
      { offset: .95, transform: at(P2), opacity: 0 },
      { offset: 1, transform: at(P2), opacity: 0 }
    ], o));
    anims.push(ghost.animate([
      { offset: 0, transform: atG(P1, 1), opacity: 0 },
      { offset: .31, transform: atG(P1, 1), opacity: 0 },
      { offset: .33, transform: atG(P1, 1.04), opacity: 1 },
      { offset: .63, transform: atG(P2, 1.04), opacity: 1 },
      { offset: .67, transform: atG(P2, .9), opacity: 0 },
      { offset: 1, transform: atG(P2, .9), opacity: 0 }
    ], o));
    anims.push(placed.animate([
      { offset: 0, opacity: 0, transform: 'scale(.94)' },
      { offset: .64, opacity: 0, transform: 'scale(.94)' },
      { offset: .69, opacity: 1, transform: 'scale(1.03)' },
      { offset: .74, opacity: 1, transform: 'scale(1)' },
      { offset: .9, opacity: 1, transform: 'scale(1)' },
      { offset: .96, opacity: 0, transform: 'scale(1)' },
      { offset: 1, opacity: 0, transform: 'scale(1)' }
    ], lin));
    Array.prototype.forEach.call(snaps, function (s) {
      anims.push(s.animate([
        { offset: 0, opacity: 0 }, { offset: .65, opacity: 0 }, { offset: .69, opacity: 1 },
        { offset: .84, opacity: 1 }, { offset: .92, opacity: 0 }, { offset: 1, opacity: 0 }
      ], lin));
    });
    setTimeout(function () { loop.classList.add('is-picked'); }, TOTAL * .31);
    setTimeout(function () { loop.classList.remove('is-picked'); }, TOTAL * .66);
    anims[0].finished.then(function () {
      // Three runs, then it rests on the landed clip; touching the tempo or key plays it again.
      if (cycles >= 3) { stop(); placed.style.opacity = 1; return; }
      timer = setTimeout(function () { if (visible) run(); else waitVisible(); }, 400);
    }).catch(function () {});
  }
  function waitVisible() {
    var t = setInterval(function () { if (visible) { clearInterval(t); run(); } }, 400);
  }

  // Silent A/B: the same drag, as recorded or matched to the project.
  Array.prototype.forEach.call(rig.querySelectorAll('.ab-btn'), function (b) {
    b.addEventListener('click', function () {
      mode = b.dataset.mode;
      Array.prototype.forEach.call(rig.querySelectorAll('.ab-btn'), function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      words(); cycles = 0; run();
    });
  });
  // Controls
  var keysBox = rig.querySelector('.rig-keys');
  KEYS.forEach(function (k) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rig-key'; b.dataset.k = k[0]; b.textContent = k[0]; b.setAttribute('aria-label', k[1]);
    b.addEventListener('click', function () { key = k; words(); cycles = 0; run(); });
    keysBox.appendChild(b);
  });
  Array.prototype.forEach.call(rig.querySelectorAll('.rig-step'), function (b) {
    b.addEventListener('click', function () { bpm = Math.max(80, Math.min(170, bpm + Number(b.dataset.bpm))); words(); cycles = 0; run(); });
  });

  build(); words();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .25 }).observe(rig);
  }
  window.addEventListener('resize', function () { clearTimeout(rig._rs); rig._rs = setTimeout(run, 200); });
  new MutationObserver(function () { build(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(run, 700); });
})();
