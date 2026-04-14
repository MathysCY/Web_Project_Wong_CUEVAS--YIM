/**
 * carousel.js — Auto-playing image carousel with manual controls
 * EFREI CS Department Website
 */

(function () {
  'use strict';

  /**
   * Initializes a single carousel instance.
   * @param {HTMLElement} wrapper - The .carousel-wrapper element
   */
  function initCarousel(wrapper) {
    const track = wrapper.querySelector('.carousel-track');
    const slides = wrapper.querySelectorAll('.carousel-slide');
    const prevBtn = wrapper.parentElement.querySelector('.carousel-btn-prev');
    const nextBtn = wrapper.parentElement.querySelector('.carousel-btn-next');
    const dotsContainer = wrapper.parentElement.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoPlayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    /* Build dots */
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function () {
          goTo(i);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].setAttribute('aria-hidden', 'true');
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      slides[current].removeAttribute('aria-hidden');

      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach(function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, AUTOPLAY_DELAY);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    /* Button event listeners */
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { next(); resetAutoPlay(); });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function () { prev(); resetAutoPlay(); });
    }

    /* Keyboard navigation */
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); resetAutoPlay(); }
      if (e.key === 'ArrowRight') { next(); resetAutoPlay(); }
    });

    /* Pause on hover */
    wrapper.addEventListener('mouseenter', function () { clearInterval(autoPlayTimer); });
    wrapper.addEventListener('mouseleave', startAutoPlay);

    /* Touch / swipe support */
    let touchStartX = 0;
    let touchEndX = 0;

    wrapper.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    wrapper.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { next(); } else { prev(); }
        resetAutoPlay();
      }
    }, { passive: true });

    /* Init */
    goTo(0);
    startAutoPlay();
  }

  /* Initialize all carousels on page */
  document.querySelectorAll('.carousel-wrapper').forEach(function (wrapper) {
    initCarousel(wrapper);
  });

})();
