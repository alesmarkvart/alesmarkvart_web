(function () {
  'use strict';

  // ============================================================
  // PARTICLE / MESH CANVAS
  // ============================================================
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const mouse = { x: -9999, y: -9999, active: false };

  const CFG = {
    count:     90,
    maxDist:   140,
    mouseDist: 190,
    speed:     0.35,
    gold:      [227, 100, 2],
  };

  let particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CFG.speed;
      this.vy = (Math.random() - 0.5) * CFG.speed;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.45 + 0.15;
    }

    update() {
      if (mouse.active) {
        const dx   = this.x - mouse.x;
        const dy   = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CFG.mouseDist && dist > 0) {
          const force = ((CFG.mouseDist - dist) / CFG.mouseDist) * 0.6;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      this.vx *= 0.975;
      this.vy *= 0.975;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      const [r, g, b] = CFG.gold;
      ctx.fillStyle = `rgba(${r},${g},${b},${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < CFG.count; i++) {
      particles.push(new Particle());
    }
  }

  function drawEdges() {
    const [r, g, b] = CFG.gold;

    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i];

      // Particle-to-particle edges
      for (let j = i + 1; j < particles.length; j++) {
        const pj = particles[j];
        const dx   = pi.x - pj.x;
        const dy   = pi.y - pj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CFG.maxDist) {
          const alpha = (1 - dist / CFG.maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Particle-to-mouse edges
      if (mouse.active) {
        const dx   = pi.x - mouse.x;
        const dy   = pi.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CFG.mouseDist) {
          const alpha = (1 - dist / CFG.mouseDist) * 0.55;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawEdges();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(tick);
  }

  // Mouse tracking (relative to canvas)
  window.addEventListener('mousemove', function (e) {
    const rect  = canvas.getBoundingClientRect();
    mouse.x     = e.clientX - rect.left;
    mouse.y     = e.clientY - rect.top;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', function () {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length) {
      const rect  = canvas.getBoundingClientRect();
      mouse.x     = e.touches[0].clientX - rect.left;
      mouse.y     = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', function () {
    mouse.active = false;
  }, { passive: true });

  window.addEventListener('resize', function () {
    resize();
    buildParticles();
  });

  resize();
  buildParticles();
  tick();

  // ============================================================
  // NAVIGATION — scroll state & smooth anchor scrolling
  // ============================================================
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id     = this.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  // ============================================================
  // HAMBURGER / MOBILE MENU
  // ============================================================
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const spans      = hamburger.querySelectorAll('span');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // ============================================================
  // TYPEWRITER EFFECT — looping phrases
  // ============================================================
  const typeEl  = document.getElementById('typewriter');
  const phrases = [
    'Gastro konzultant',
    'Gastro školitel',
    'Mystery shopper',
    'Tvůrce gastro webů',
  ];
  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  function typeLoop() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      // Typing
      typeEl.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        // Pause at full phrase, then start deleting
        setTimeout(function () { deleting = true; typeLoop(); }, 1800);
        return;
      }
      setTimeout(typeLoop, 60 + Math.random() * 35);
    } else {
      // Deleting
      typeEl.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        // Pause before typing next phrase
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35 + Math.random() * 20);
    }
  }

  // Start after hero animations have revealed
  setTimeout(typeLoop, 1400);

  // ============================================================
  // HERO REVEAL
  // ============================================================
  document.querySelectorAll('.reveal-up, .reveal-photo').forEach(function (el) {
    el.classList.add('animate');
  });

  // ============================================================
  // SCROLL FADE-IN (IntersectionObserver)
  // ============================================================
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      // Stagger children within the same parent grid/list
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')
      );
      const pos = siblings.indexOf(entry.target);
      const delay = Math.max(0, pos) * 90;

      setTimeout(function () {
        entry.target.classList.add('visible');
      }, delay);

      io.unobserve(entry.target);
    });
  }, {
    threshold:  0.08,
    rootMargin: '0px 0px -50px 0px',
  });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    io.observe(el);
  });

  // ============================================================
  // MENU COURSES — individual scroll observer, natural stagger
  // ============================================================
  const courseIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      courseIO.unobserve(entry.target);
    });
  }, {
    threshold:  0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.fade-course, .fade-course-sep').forEach(function (el) {
    courseIO.observe(el);
  });

  // ============================================================
  // CONTACT FORM
  // ============================================================
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      var btn = contactForm.querySelector('button[type="submit"]');
      var errorEl = contactForm.querySelector('.form-error');
      if (errorEl) errorEl.remove();

      var data = {
        name:    document.getElementById('f-name').value.trim(),
        email:   document.getElementById('f-email').value.trim(),
        phone:   document.getElementById('f-phone').value.trim(),
        message: document.getElementById('f-message').value.trim(),
      };

      if (!data.name || !data.email || !data.message) {
        showFormError(contactForm, btn, 'Vyplňte prosím jméno, e-mail a zprávu.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Odesílám…';

      try {
        var res  = await fetch('https://formspree.io/f/xaqkenjr', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(data),
        });
        var json = await res.json();

        if (res.ok) {
          if (typeof gtag === 'function') {
            gtag('event', 'form_submit', { event_category: 'contact', event_label: 'contact_form' });
          }
          contactForm.innerHTML = '<p class="form-success">Zpráva odeslána — ozvu se co nejdříve.</p>';
        } else {
          throw new Error(json.error || 'Chyba při odesílání.');
        }
      } catch (err) {
        showFormError(contactForm, btn, err.message);
      }
    });
  }

  function showFormError(form, btn, msg) {
    var p = document.createElement('p');
    p.className = 'form-error';
    p.textContent = msg;
    form.appendChild(p);
    btn.disabled = false;
    btn.textContent = 'Odeslat zprávu';
  }

  // ============================================================
  // COOKIE CONSENT
  // ============================================================
  var cookieBar      = document.getElementById('cookieBar');
  var cookieAccept   = document.getElementById('cookieAccept');
  var cookieSettings = document.getElementById('cookieSettings');
  var cookieModal    = document.getElementById('cookieModal');
  var cookieOverlay  = document.getElementById('cookieOverlay');
  var cookieSave     = document.getElementById('cookieSave');
  var toggleAnalytics = document.getElementById('toggleAnalytics');
  var toggleMarketing = document.getElementById('toggleMarketing');

  function hideBoth() {
    cookieBar.classList.remove('visible');
    closeModal();
  }

  function openModal() {
    cookieModal.classList.add('open');
    cookieModal.removeAttribute('aria-hidden');
  }

  function closeModal() {
    cookieModal.classList.remove('open');
    cookieModal.setAttribute('aria-hidden', 'true');
  }

  function applyConsent(analytics, marketing) {
    localStorage.setItem('cookie_consent', 'granted');
    localStorage.setItem('cookie_analytics', analytics ? 'granted' : 'denied');
    localStorage.setItem('cookie_marketing', marketing ? 'granted' : 'denied');
    gtag('consent', 'update', {
      analytics_storage:  analytics ? 'granted' : 'denied',
      ad_storage:         marketing ? 'granted' : 'denied',
      ad_user_data:       marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
    });
  }

  if (cookieBar && !localStorage.getItem('cookie_consent')) {
    setTimeout(function () { cookieBar.classList.add('visible'); }, 1000);

    cookieAccept.addEventListener('click', function () {
      applyConsent(true, false);
      hideBoth();
    });

    cookieSettings.addEventListener('click', openModal);
    cookieOverlay.addEventListener('click', closeModal);

    cookieSave.addEventListener('click', function () {
      applyConsent(toggleAnalytics.checked, toggleMarketing.checked);
      hideBoth();
    });
  }

  // ============================================================
  // PRICING — prefill contact form
  // ============================================================
  document.querySelectorAll('.pricing-cta[data-package]').forEach(function (link) {
    link.addEventListener('click', function () {
      var msg = document.getElementById('f-message');
      if (msg) {
        msg.value = 'Mám zájem o ' + link.dataset.package + '.';
      }
    });
  });

})();
