// Day (white) by default, night (graphite) on toggle, remembered per visitor; gentle scroll reveals.
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

    var hdr = document.querySelector('header.top');
    var progress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (hdr) hdr.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(3) : 0);
    };
    window.addEventListener('scroll', progress, { passive: true }); progress();

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll('.head, .compare, .feature, .works, .grid .card, .tile, .plan, .download .card, .safe, .seats, .faq details');
    targets.forEach(function (el) {
      el.classList.add('reveal');
      var i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (el.matches('.grid .card, .tile, .plan, .download .card, .faq details')) el.style.transitionDelay = Math.min(i, 4) * 70 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  });
})();
