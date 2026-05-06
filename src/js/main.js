/**
 * Eskdale Art Show — Main Script
 * Loads JSON data, renders dynamic content, manages artist modal + lightbox,
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
        <span class="category-icon" role="img" aria-hidden="true">${CATEGORY_ICONS[cat.icon] || '\u{1F3A8}'}</span>
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.description)}</p>
      </div>
    `).join('');
  }

  // --- Render Artists ---
  function renderArtists(artists) {
    const grid = document.getElementById('artists-grid');
    if (!grid) return;

    grid.innerHTML = artists.map((a, i) => {
      const featured = a.featured
        || (a.images && a.images.works && a.images.works[0] && a.images.works[0].src)
        || null;
      const icon = CATEGORY_ICONS[a.categoryIcon] || CATEGORY_ICONS.palette;
      const mediumText = a.category
        || (Array.isArray(a.medium) ? a.medium.join(', ') : (a.medium || ''));
      const media = featured
        ? `<img src="${esc(featured)}" alt="Work by ${esc(a.name)}" loading="lazy">`
        : `<span class="artist-card-icon" role="img" aria-hidden="true">${icon}</span>`;
      const mediaClass = featured ? 'artist-card-media' : 'artist-card-media artist-card-media--placeholder';
      return `
        <button type="button" class="artist-card reveal" data-artist-index="${i}" aria-label="View details for ${esc(a.name)}">
          <span class="${mediaClass}">${media}</span>
          <span class="artist-card-body">
            <span class="artist-card-name">${esc(a.name)}</span>
            ${mediumText ? `<span class="artist-card-medium">${esc(mediumText)}</span>` : ''}
          </span>
        </button>
      `;
    }).join('');
  }

  // --- Artist Modal ---
  function initArtistModal(artists) {
    const modal = document.getElementById('artist-modal');
    if (!modal) return;

    const body = modal.querySelector('.artist-modal-body');
    const closeBtn = modal.querySelector('.artist-modal-close');
    let triggerEl = null;

    function open(index) {
      const a = artists[index];
      if (!a) return;
      triggerEl = document.querySelector(`.artist-card[data-artist-index="${index}"]`);
      body.innerHTML = renderArtistDetail(a);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.scrollTop = 0;
      closeBtn.focus();
    }

    function close() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (triggerEl) triggerEl.focus();
    }

    document.querySelectorAll('.artist-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.artistIndex, 10);
        if (!Number.isNaN(idx)) open(idx);
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('artist-modal-close')) close();
    });

    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const lb = document.getElementById('lightbox');
      if (lb && lb.classList.contains('active')) return; // let lightbox swallow it
      close();
    });
  }

  function renderArtistDetail(a) {
    const works = (a.images && a.images.works) || [];
    const worksHTML = works.length ? `
      <div class="artist-modal-works">
        ${works.map(w => `
          <figure class="artist-work" tabindex="0" role="button"
                  data-src="${esc(w.src)}"
                  data-title="${esc(w.title || '')}"
                  data-artist="${esc(a.name)}"
                  aria-label="Open ${esc(w.title || 'artwork')} by ${esc(a.name)}">
            <img src="${esc(w.src)}" alt="${esc(w.title || 'Artwork')} by ${esc(a.name)}" loading="lazy">
            ${w.title ? `<figcaption>${esc(w.title)}</figcaption>` : ''}
          </figure>
        `).join('')}
      </div>
    ` : '';

    const contact = a.contact || {};
    const social = a.social || {};
    const contactItems = [];
    if (contact.website) {
      contactItems.push(`<a href="${esc(contact.website)}" target="_blank" rel="noopener">Website</a>`);
    }
    if (social.facebook) {
      contactItems.push(`<a href="${esc(social.facebook)}" target="_blank" rel="noopener">Facebook</a>`);
    }
    if (social.instagram) {
      contactItems.push(`<a href="${esc(social.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
    }

    return `
      <header class="artist-modal-header">
        <h2 id="artist-modal-name">${esc(a.name)}</h2>
        ${a.role ? `<p class="artist-modal-role">${esc(a.role)}</p>` : ''}
        ${a.company ? `<p class="artist-modal-company">${esc(a.company)}</p>` : ''}
        ${a.category ? `<p class="artist-modal-category">${esc(a.category)}</p>` : ''}
      </header>
      ${a.bio ? `<p class="artist-modal-bio">${esc(a.bio)}</p>` : ''}
      ${worksHTML}
      ${contactItems.length ? `<div class="artist-modal-contact">${contactItems.join(' &middot; ')}</div>` : ''}
    `;
  }

  // --- Lightbox (for artwork images) ---
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    let triggerEl = null;
    let items = [];

    function setImage(el) {
      lbImg.src = el.dataset.src;
      lbImg.alt = el.dataset.title
        ? `${el.dataset.title} by ${el.dataset.artist}`
        : `Artwork by ${el.dataset.artist}`;
      lbCaption.textContent = el.dataset.title
        ? `${el.dataset.title} — ${el.dataset.artist}`
        : el.dataset.artist;
    }

    function open(el) {
      triggerEl = el;
      const scope = el.closest('.artist-modal') || document;
      items = Array.from(scope.querySelectorAll('.artist-work'));
      setImage(el);
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      if (triggerEl) triggerEl.focus();
    }

    function adjacent(direction) {
      if (!items.length) return;
      const idx = items.indexOf(triggerEl);
      const next = items[(idx + direction + items.length) % items.length];
      triggerEl = next;
      setImage(next);
    }

    document.addEventListener('click', (e) => {
      const work = e.target.closest('.artist-work');
      if (work) open(work);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const active = document.activeElement;
      if (active && active.classList.contains('artist-work')) {
        e.preventDefault();
        open(active);
      }
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) close();
    });

    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'ArrowLeft') { adjacent(-1); return; }
      if (e.key === 'ArrowRight') { adjacent(1); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtn.focus();
      }
    });
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

    const carousel = track.parentElement;
    const prevBtn = carousel.querySelector('.carousel-btn--prev');
    const nextBtn = carousel.querySelector('.carousel-btn--next');
    let current = 0;
    let autoTimer = null;
    let autoPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Live region for screen readers
    const statusEl = document.createElement('div');
    statusEl.className = 'sr-only';
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.id = 'carousel-status';
    carousel.appendChild(statusEl);

    // Pause/play button
    const pauseBtn = document.createElement('button');
    pauseBtn.classList.add('carousel-btn', 'carousel-btn--pause');
    pauseBtn.setAttribute('aria-label', autoPaused ? 'Play carousel' : 'Pause carousel');
    pauseBtn.textContent = autoPaused ? '\u25B6' : '\u23F8';
    carousel.appendChild(pauseBtn);

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
      statusEl.textContent = `Poster ${current + 1} of ${slides.length}`;
      resetAuto();
    }

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
      if (!autoPaused) {
        autoTimer = setInterval(() => goTo(current + 1), 5000);
      }
    }

    function togglePause() {
      autoPaused = !autoPaused;
      if (autoPaused) {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
        pauseBtn.textContent = '\u25B6';
        pauseBtn.setAttribute('aria-label', 'Play carousel');
      } else {
        resetAuto();
        pauseBtn.textContent = '\u23F8';
        pauseBtn.setAttribute('aria-label', 'Pause carousel');
      }
    }

    pauseBtn.addEventListener('click', togglePause);

    // Pause auto-play on hover and focus
    carousel.addEventListener('mouseenter', () => {
      if (!autoPaused && autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    });
    carousel.addEventListener('mouseleave', () => {
      if (!autoPaused) resetAuto();
    });
    carousel.addEventListener('focusin', () => {
      if (!autoPaused && autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    });
    carousel.addEventListener('focusout', (e) => {
      if (!autoPaused && !carousel.contains(e.relatedTarget)) resetAuto();
    });

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
    carousel.addEventListener('keydown', (e) => {
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

      // Scale canvas context for HiDPI parity with JS fallback
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let lastTime = performance.now();
      let paused = false;
      let animId = null;

      const observer = new IntersectionObserver(([entry]) => {
        paused = !entry.isIntersecting;
        if (paused) {
          system.pause();
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        } else {
          system.resume();
          lastTime = performance.now();
          if (!animId) animId = requestAnimationFrame(frame);
        }
      }, { threshold: 0 });
      observer.observe(hero);

      new ResizeObserver(() => {
        const r = hero.getBoundingClientRect();
        const currentDpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = r.width * currentDpr;
        canvas.height = r.height * currentDpr;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        if (ctx) ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
        system.resize(canvas.width, canvas.height);
      }).observe(hero);

      function frame(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        system.tick(dt);
        animId = requestAnimationFrame(frame);
      }
      animId = requestAnimationFrame(frame);
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

  // --- Escape HTML (string-based, no DOM allocation) ---
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(str) {
    return (str || '').replace(/[&<>"']/g, c => ESC_MAP[c]);
  }

  // --- Map Embed ---
  function renderMap(venue) {
    const iframe = document.getElementById('map-iframe');
    if (!iframe || !venue.mapEmbed) return;
    if (venue.mapEmbed.startsWith('https://')) {
      iframe.src = venue.mapEmbed;
    }
  }

  // --- Boot ---
  async function boot() {
    try {
      const [event, artistsData] = await Promise.all([
        loadJSON('data/event.json'),
        loadJSON('data/artists.json')
      ]);

      // Populate static elements via textContent (XSS-safe)
      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      setText('hero-edition', event.edition);
      setText('hero-title', event.name);
      setText('hero-dates', event.dates.display);
      setText('hero-times', event.times);
      setText('hero-admission', event.admission);
      setText('about-description', event.description);
      setText('refreshments-text', event.refreshments);
      setText('exhibitor-note', event.exhibitorNote);

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
      if (mapsLinkEl && event.venue.mapsLink && event.venue.mapsLink.startsWith('https://')) {
        mapsLinkEl.href = event.venue.mapsLink;
      }

      renderMap(event.venue);
      renderCategories(event.categories);
      renderContact(event.contact);
      initCountdown(event.dates.start);

      // Open Gardens
      if (event.openGardens) {
        const og = event.openGardens;
        setText('gardens-tagline', og.tagline);
        setText('gardens-description', og.description);
        const whenEl = document.getElementById('gardens-when');
        if (whenEl) whenEl.innerHTML = `${esc(og.date)}<br>${esc(og.times)}`;
        const admEl = document.getElementById('gardens-admission');
        if (admEl) admEl.innerHTML = `${esc(og.admission.adults)}<br>${esc(og.admission.children)}`;
        setText('gardens-tickets', og.tickets);
      }

      // Artists
      const artists = (artistsData && artistsData.artists) || [];
      renderArtists(artists);
      initArtistModal(artists);
      initLightbox();

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
