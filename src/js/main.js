/**
 * Eskdale Art Show — Main Script
 * Loads JSON data, renders dynamic content, manages gallery lightbox,
 * countdown timer, scroll reveal fallback, and WASM brushstroke init.
 */

(function () {
  'use strict';

  // --- Data Loading ---
  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  // --- Countdown ---
  function initCountdown(startDate) {
    const el = document.getElementById('countdown');
    if (!el) return;

    function update() {
      const now = new Date();
      const target = new Date(startDate + 'T10:00:00');
      const diff = target - now;

      if (diff <= 0) {
        el.textContent = 'The show is on now!';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 1) {
        el.textContent = `${days} days to go`;
      } else if (days === 1) {
        el.textContent = 'Tomorrow!';
      } else {
        el.textContent = `${hours} hours to go`;
      }
    }

    update();
    setInterval(update, 60000);
  }

  // --- Category Icons ---
  const CATEGORY_ICONS = {
    palette: '\u{1F3A8}',
    camera: '\u{1F4F7}',
    pottery: '\u{1FAD9}',
    gem: '\u{1F48E}',
    tree: '\u{1FAB5}',
    print: '\u{1F5BC}',
    textile: '\u{1F9F5}',
    card: '\u{2709}'
  };

  // --- Render Categories ---
  function renderCategories(categories) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = categories.map(cat => `
      <div class="category-card reveal">
        <span class="category-icon">${CATEGORY_ICONS[cat.icon] || '\u{1F3A8}'}</span>
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.description)}</p>
      </div>
    `).join('');
  }

  // --- Render Gallery ---
  function renderGallery(items) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => `
      <figure class="gallery-item reveal" data-src="${esc(item.image)}" data-title="${esc(item.title)}" data-artist="${esc(item.artist)}">
        <img src="${esc(item.image)}" alt="${esc(item.title)} by ${esc(item.artist)}" loading="lazy" width="400" height="300">
        <figcaption class="gallery-caption">
          <h4>${esc(item.title)}</h4>
          <p>${esc(item.artist)} &middot; ${esc(item.medium)}</p>
        </figcaption>
      </figure>
    `).join('');

    initLightbox();
  }

  // --- Lightbox ---
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        lbImg.src = item.dataset.src;
        lbImg.alt = item.dataset.title;
        lbCaption.textContent = `${item.dataset.title} — ${item.dataset.artist}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --- Render Contact ---
  function renderContact(contact) {
    const grid = document.getElementById('contact-grid');
    if (!grid) return;

    const items = [];
    if (contact.phone) {
      items.push(`<div class="contact-item"><p class="contact-label">Phone</p><a href="tel:${esc(contact.phone.replace(/\s/g, ''))}">${esc(contact.phone)}</a></div>`);
    }
    if (contact.email) {
      items.push(`<div class="contact-item"><p class="contact-label">Email</p><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></div>`);
    }
    if (contact.facebook) {
      items.push(`<div class="contact-item"><p class="contact-label">Facebook</p><a href="${esc(contact.facebook)}" target="_blank" rel="noopener">Eskdale Artshow</a></div>`);
    }
    if (contact.twitter) {
      items.push(`<div class="contact-item"><p class="contact-label">Twitter</p><a href="${esc(contact.twitter)}" target="_blank" rel="noopener">@eskdaleart</a></div>`);
    }
    grid.innerHTML = items.join('');
  }

  // --- Poster Carousel ---
  function initCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!track || !dotsContainer) return;

    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    const prevBtn = track.parentElement.querySelector('.carousel-btn--prev');
    const nextBtn = track.parentElement.querySelector('.carousel-btn--next');
    let current = 0;
    let autoTimer = null;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Show poster ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(idx) {
      current = ((idx % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
      resetAuto();
    }

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Swipe support
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) goTo(current + (dx > 0 ? -1 : 1));
    }, { passive: true });

    // Keyboard
    track.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    resetAuto();
  }

  // --- Scroll Reveal Fallback ---
  function initRevealFallback() {
    if (CSS.supports && CSS.supports('animation-timeline: view()')) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // --- WASM Brushstroke Init ---
  async function initBrushstrokes() {
    if (typeof WebAssembly === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('brushstroke-canvas');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const isMobile = matchMedia('(max-width: 768px)').matches;

    // Try WASM module first, fall back to JS implementation
    try {
      const wasm = await import('../wasm/pkg/brushstroke_particles.js');
      await wasm.default();
      const system = new wasm.ParticleSystem(canvas, isMobile);

      let lastTime = performance.now();
      let paused = false;

      const observer = new IntersectionObserver(([entry]) => {
        paused = !entry.isIntersecting;
        if (paused) system.pause(); else system.resume();
      }, { threshold: 0 });
      observer.observe(hero);

      new ResizeObserver(() => {
        const r = hero.getBoundingClientRect();
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        system.resize(canvas.width, canvas.height);
      }).observe(hero);

      function frame(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        system.tick(dt);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      return;
    } catch (_) {
      // WASM not available, try JS fallback
    }

    try {
      const fallback = await import('./wasm-fallback.js');
      fallback.init(canvas, hero);
    } catch (e) {
      console.debug('Brushstroke effect unavailable:', e.message);
    }
  }

  // --- Escape HTML ---
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // --- Map Embed ---
  function renderMap(venue) {
    const iframe = document.getElementById('map-iframe');
    if (!iframe || !venue.mapEmbed) return;
    iframe.src = venue.mapEmbed;
  }

  // --- Boot ---
  async function boot() {
    try {
      const event = await loadJSON('data/event.json');

      // Populate static elements
      const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };
      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      setText('hero-edition', event.edition);
      setText('hero-title', event.name);
      setText('hero-dates', event.dates.display);
      setText('hero-times', event.times);
      setText('hero-admission', event.admission);
      setHtml('about-description', event.description);
      setHtml('refreshments-text', event.refreshments);
      setHtml('exhibitor-note', event.exhibitorNote);

      // Venue
      const addrEl = document.getElementById('venue-address');
      if (addrEl) {
        addrEl.innerHTML = `${esc(event.venue.name)}<br>${esc(event.venue.address)}`;
      }
      const transportEl = document.getElementById('venue-transport');
      if (transportEl) transportEl.textContent = event.venue.transport;

      const w3wEl = document.getElementById('venue-w3w');
      if (w3wEl && event.venue.what3words) {
        w3wEl.innerHTML = `<a href="https://w3w.co/${esc(event.venue.what3words)}" target="_blank" rel="noopener">///${esc(event.venue.what3words)}</a>`;
      }

      const mapsLinkEl = document.getElementById('maps-link');
      if (mapsLinkEl) mapsLinkEl.href = event.venue.mapsLink;

      renderMap(event.venue);
      renderCategories(event.categories);
      renderContact(event.contact);
      initCountdown(event.dates.start);

      // Gallery
      const gallery = await loadJSON('data/gallery.json');
      renderGallery(gallery.items);

      // Post-render
      initCarousel();
      initRevealFallback();
      initBrushstrokes();

    } catch (err) {
      console.error('Failed to boot site:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
