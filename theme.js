// Theme (light by default, remembered per visitor) and gentle scroll reveals.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('hs-theme'); } catch (e) {}
  root.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
  root.classList.add('js');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('hs-theme', t); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.hero-text, .hero .shot, .head, .compare, .feature-text, .frame, .grid .card, .plan, .download .card, .safe, .seats, .faq details');
    // Scroll cue fades once the visitor starts scrolling.
    var onScroll = function () { root.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Hero film: plays only while on screen, never with reduced motion.
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      if (reduce) { v.pause(); v.removeAttribute('autoplay'); return; }
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      }, { threshold: 0.2 }).observe(v);
    });
    if (reduce || !('IntersectionObserver' in window)) return;
    targets.forEach(function (el) {
      el.classList.add('reveal');
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (el.matches('.grid .card, .plan, .download .card, .faq details')) el.style.transitionDelay = Math.min(sibs, 4) * 80 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  });
})();
