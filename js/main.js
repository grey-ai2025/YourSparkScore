/* =====================================================================
   GREY AI | Spark Score™ Survey landing page
   Behavior: footer year, smooth-scroll, animated spark constellation
   ===================================================================== */

(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Smooth-scroll for Get Started + scroll cue ----------
     (CSS scroll-behavior handles most browsers; this is the JS fallback) */
  document.querySelectorAll('a[href="#survey"]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = document.getElementById('survey');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Spark constellation ---------- */
  initSparkConstellation();

  function initSparkConstellation() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.getElementById('spark');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var particles = [];
    var rafId = null;

    var ACCENT = [
      'rgba(47,214,195,',   // spark
      'rgba(94,230,208,',   // bright
      'rgba(17,165,150,',   // deep
      'rgba(191,245,236,'   // pale
    ];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function rand(min, max) {
      // deterministic enough for decorative motion; Math.random is fine in browser
      return min + Math.random() * (max - min);
    }

    function buildParticles() {
      // Density scales with area; capped for performance, fewer on small screens.
      var area = w * h;
      var base = w < 600 ? 4200 : 7000;
      var count = Math.max(10, Math.min(34, Math.round(area / base)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var r = rand(2.2, 6.5);
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          r: r,
          vx: rand(-0.18, 0.18),
          vy: rand(-0.16, 0.16),
          hue: ACCENT[Math.floor(rand(0, ACCENT.length))],
          a: rand(0.45, 0.95),
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.006, 0.018)
        });
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      drawLinks();
      for (var i = 0; i < particles.length; i++) drawDot(particles[i], particles[i].a);
    }

    function drawDot(p, alpha) {
      // glow
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.4);
      g.addColorStop(0, p.hue + (alpha * 0.5) + ')');
      g.addColorStop(1, p.hue + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
      ctx.fill();
      // core
      ctx.fillStyle = p.hue + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLinks() {
      var maxDist = w < 600 ? 90 : 130;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            var o = (1 - d / maxDist) * 0.28;
            ctx.strokeStyle = 'rgba(47,214,195,' + o + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      drawLinks();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        p.pulse += p.pulseSpeed;
        var alpha = p.a * (0.7 + 0.3 * Math.sin(p.pulse));
        drawDot(p, alpha);
      }
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (rafId) cancelAnimationFrame(rafId);
      if (prefersReduced) { drawStatic(); return; }
      tick();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); start(); }, 150);
    });

    // Pause when hero is offscreen to save battery
    var hero = document.getElementById('hero');
    if ('IntersectionObserver' in window && hero && !prefersReduced) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { if (!rafId) tick(); }
          else { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
        });
      }, { threshold: 0.01 }).observe(hero);
    }

    resize();
    start();
  }
})();
