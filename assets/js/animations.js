/**
 * animations.js — Scroll reveal, stat counters, tilt, lightbox
 * EFREI CS Department Website
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createDiv(className) {
    const el = document.createElement('div');
    el.className = className;
    return el;
  }

  /* ===================================================
     SHARED SITE BACKGROUND
     =================================================== */
  function initSiteBackground() {
    if (document.querySelector('.site-bg')) return;

    const bg = createDiv('site-bg');
    bg.setAttribute('aria-hidden', 'true');

    bg.appendChild(createDiv('site-bg-glow'));
    bg.appendChild(createDiv('site-bg-grid'));
    bg.appendChild(createDiv('site-bg-beam'));
    bg.appendChild(createDiv('site-bg-vignette'));
    bg.appendChild(createDiv('site-bg-orb site-bg-orb-1'));
    bg.appendChild(createDiv('site-bg-orb site-bg-orb-2'));
    bg.appendChild(createDiv('site-bg-orb site-bg-orb-3'));

    document.body.prepend(bg);

    if (prefersReducedMotion) {
      bg.classList.add('reduced-motion');
    }
  }

  /* ===================================================
     SCROLL REVEAL (Intersection Observer)
     =================================================== */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ===================================================
     ANIMATED STAT COUNTERS
     =================================================== */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = parseInt(el.getAttribute('data-duration') || '2000', 10);
    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    let start = 0;

    el.classList.add('is-counting');

    function update(now) {
      if (!start) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.classList.remove('is-counting');
      }
    }

    window.setTimeout(function () {
      requestAnimationFrame(update);
    }, delay);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    function startCounter(el, observer) {
      if (el.dataset.countStarted === 'true') return;
      el.dataset.countStarted = 'true';
      el.textContent = '0';
      animateCounter(el);
      if (observer) observer.unobserve(el);
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startCounter(entry.target, observer);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    counters.forEach(function (el) {
      el.textContent = '0';
      observer.observe(el);
    });
  }

  /* ===================================================
     CARD TILT EFFECT
     =================================================== */
  function initTilt() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.tilt-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  /* ===================================================
     LIGHTBOX
     =================================================== */
  function initLightbox() {
    const galleryItems = document.querySelectorAll('[data-lightbox]');
    if (!galleryItems.length) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.style.display = 'none';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    const img = document.createElement('img');
    img.setAttribute('alt', '');

    const caption = document.createElement('p');
    caption.style.cssText = 'color:#94a3b8;text-align:center;margin-top:0.75rem;font-size:0.875rem;';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image viewer');
    closeBtn.innerHTML = '&#x2715;';

    content.appendChild(img);
    content.appendChild(caption);
    content.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    let currentIndex = 0;
    const items = Array.from(galleryItems);

    function openLightbox(index) {
      currentIndex = index;
      const item = items[currentIndex];
      const src = item.getAttribute('data-lightbox') || item.querySelector('img').src;
      const alt = item.getAttribute('data-caption') || item.querySelector('img').getAttribute('alt') || '';
      img.src = src;
      img.alt = alt;
      caption.textContent = alt;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + items.length) % items.length;
      openLightbox(currentIndex);
    }

    items.forEach(function (item, i) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function () { openLightbox(i); });
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (overlay.style.display === 'none') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  /* ===================================================
     TYPING ANIMATION
     =================================================== */
  function initTypingAnimation() {
    const el = document.getElementById('typing-target');
    if (!el) return;

    const phrases = [
      'Innovation.',
      'Excellence.',
      'Research.',
      'Leadership.',
      'The Future.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      el.textContent = current.substring(0, charIndex);

      let speed = isDeleting ? 60 : 110;

      if (!isDeleting && charIndex === current.length) {
        speed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
      }

      typingTimer = window.setTimeout(type, speed);
    }

    el.textContent = '';
    type();
  }

  /* ===================================================
     PROGRESS BARS (skills / course completion)
     =================================================== */
  function initProgressBars() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    if (!bars.length) return;

    if (prefersReducedMotion) {
      bars.forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-width');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.getAttribute('data-width');
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (bar) {
      bar.style.width = '0';
      observer.observe(bar);
    });
  }

  /* ===================================================
     STICKY TABLE OF CONTENTS / SECTION HIGHLIGHT
     =================================================== */
  function initSectionHighlight() {
    const sideLinks = document.querySelectorAll('[data-section-link]');
    if (!sideLinks.length) return;

    const sections = [];
    sideLinks.forEach(function (link) {
      const id = link.getAttribute('data-section-link');
      const section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sections.forEach(function (s) { s.link.classList.remove('active'); });
          const active = sections.find(function (s) { return s.section === entry.target; });
          if (active) active.link.classList.add('active');
        }
      });
    }, {
      threshold: 0.4,
      rootMargin: '-20% 0px -60% 0px'
    });

    sections.forEach(function (s) { observer.observe(s.section); });
  }

  /* ===================================================
     INIT ALL
     =================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initSiteBackground();
    initScrollReveal();
    initCounters();
    initTilt();
    initLightbox();
    initTypingAnimation();
    initProgressBars();
    initSectionHighlight();
  });

})();
