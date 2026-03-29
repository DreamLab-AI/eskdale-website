# Contributing Guide

Thank you for helping with the Eskdale Art Show website. This document explains how to set up a development environment, make changes, and submit them for review.

## Prerequisites

- **Git** and a **GitHub account**
- **Python 3** (for the local server — pre-installed on macOS and most Linux)
- **Rust + wasm-pack** (only if modifying the WASM brushstroke effect)

## Setup

```bash
# Clone the repository
git clone git@github.com:DreamLab-AI/eskdale-website.git
cd eskdale-website

# Serve locally
cd src && python3 -m http.server 8765
# Open http://localhost:8765 in your browser
```

The site works immediately — the WASM module is pre-built and committed, and there's a JS fallback if it's missing.

## Project Architecture

The site is a single-page static website with no build step for the HTML/CSS/JS. Content is stored in JSON files and rendered at page load by vanilla JavaScript.

```
User visits eskdaleartshow.com
  → GitHub Pages serves src/index.html
  → Browser loads src/js/main.js (ES module)
  → main.js fetches src/data/event.json and src/data/gallery.json
  → main.js renders categories, gallery, contact info into the DOM
  → main.js initialises the poster carousel
  → main.js attempts to load WASM brushstroke effect (falls back to JS)
  → CSS handles all visual presentation via custom properties
```

See [ddd.md](ddd.md) for the full domain model and bounded contexts.

## Making Changes

### Content Changes (JSON data)

Edit `src/data/event.json` or `src/data/gallery.json` directly. These files are also editable through [Pages CMS](https://pagescms.org) — see [cms-guide.md](cms-guide.md).

### Style Changes (CSS)

All styles are in `src/css/style.css`. The design system uses CSS custom properties defined in `:root` — change a colour or font in one place and it propagates everywhere. See [design-system.md](design-system.md) for the full reference.

### Layout Changes (HTML)

Edit `src/index.html`. The HTML structure uses semantic elements (`<section>`, `<nav>`, `<main>`, `<footer>`) with `id` attributes that match the navigation anchors.

Dynamic content sections have empty containers with IDs (e.g., `id="categories-grid"`, `id="gallery-grid"`) that are populated by `main.js` from JSON data.

### JavaScript Changes

`src/js/main.js` is a single IIFE (immediately invoked function expression) with no dependencies. Key functions:

| Function | Purpose |
|----------|---------|
| `loadJSON(path)` | Fetch and parse a JSON file |
| `initCountdown(date)` | Countdown timer in the hero |
| `renderCategories(data)` | Populate the "What to See" grid |
| `renderGallery(items)` | Populate the masonry gallery |
| `initLightbox()` | Click-to-enlarge for gallery images |
| `initCarousel()` | Poster carousel with auto-rotation, dots, swipe |
| `renderContact(data)` | Populate the contact grid |
| `initRevealFallback()` | IntersectionObserver for scroll animations |
| `initBrushstrokes()` | Load WASM or JS brushstroke particle effect |
| `boot()` | Main entry point — loads data and calls all renderers |

### WASM Brushstroke Effect

The particle effect is a self-contained Rust crate in `wasm/`. It renders procedural bezier-curve brushstrokes on a Canvas2D overlay.

```bash
# Build (requires Rust + wasm-pack)
cd wasm
wasm-pack build --target web --release --no-typescript --out-dir ../src/wasm/pkg
```

The JS fallback at `src/js/wasm-fallback.js` provides an identical effect without WASM. Both implementations share the same Lake District colour palette and brushstroke rendering approach.

**You do not need to build the WASM module for most changes.** The pre-built `.wasm` and `.js` glue files are committed to the repository, and the JS fallback works automatically if they're missing.

### Adding Poster Images

Poster images are static WebP files in `src/assets/images/`. To add or replace a poster:

1. Convert the source image to WebP at 800px width:
   ```bash
   magick input.jpg -resize 800x -quality 80 src/assets/images/poster-name.webp
   ```
2. Add a `<div class="carousel-slide">` entry in `src/index.html` inside `#carousel-track`
3. The carousel JS handles any number of slides automatically

## Submitting Changes

1. Create a branch: `git checkout -b your-change-description`
2. Make your changes and test locally
3. Commit with a clear message describing what and why
4. Push and open a pull request: `gh pr create`
5. The site deploys automatically when the PR is merged to `main`

## Code Conventions

- **No frameworks or build tools** for HTML/CSS/JS — keep it vanilla
- **CSS custom properties** for all colours, fonts, and spacing tokens
- **Semantic HTML** — use appropriate elements, not `<div>` for everything
- **Accessibility** — meaningful alt text, ARIA labels on interactive elements, WCAG AA contrast
- **Progressive enhancement** — the page must work without JavaScript for core content (currently JS renders from JSON, but the HTML contains fallback text in key areas)
- **UK spelling** — colour, centre, jewellery (not color, center, jewelry)

## File Size Guidelines

| Asset | Target |
|-------|--------|
| Gallery images | < 200KB each (WebP preferred) |
| Poster images | < 300KB each (WebP at 800px width) |
| CSS | Single file, no minification needed (GitHub Pages serves with gzip) |
| JS | Single file per module, no bundling |
| WASM | < 40KB uncompressed |

## Testing Checklist

Before submitting a PR:

- [ ] Site loads and renders at `http://localhost:8765`
- [ ] All sections visible: hero, about, posters, categories, gallery, visit, refreshments, contact
- [ ] Carousel advances automatically and responds to prev/next/dots
- [ ] Gallery lightbox opens on click and closes on Escape/click-outside
- [ ] Map embed loads in the visit section
- [ ] Countdown shows correct days remaining
- [ ] Navigation smooth-scrolls to each section
- [ ] Mobile: check at 375px width — nav scrolls, cards stack, gallery goes single-column
- [ ] No console errors in the browser developer tools
