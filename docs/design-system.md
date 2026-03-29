# Design System Reference

The Eskdale Art Show website uses a cohesive design system inspired by the Lake District landscape. All values are defined as CSS custom properties in `src/css/style.css` under `:root`.

## Colour Palette

Designed to sit behind artwork without competing. Warm off-whites reference watercolour paper stock rather than clinical white.

### Primary

| Role | Name | Hex | CSS Variable | Usage |
|------|------|-----|-------------|-------|
| Background | Cloud White | `#F7F5F0` | `--color-bg` | Page background, card fills |
| Background Alt | Parchment | `#EDE8DF` | `--color-bg-alt` | Alternating sections |
| Text | Slate Charcoal | `#2C3338` | `--color-text` | Body text, headings |
| Text Secondary | Fell Stone | `#6B6560` | `--color-text-secondary` | Captions, metadata |
| Accent Warm | Bracken Amber | `#B8860B` | `--color-accent-warm` | Links, CTAs, active states |
| Accent Cool | Tarn Blue | `#4A6FA5` | `--color-accent-cool` | Info badges (used sparingly) |

### Supporting

| Role | Name | Hex | CSS Variable | Usage |
|------|------|-----|-------------|-------|
| Green | Fell Green | `#5B7B5E` | `--color-fell-green` | Section dividers, icon accents |
| Border | Slate Mist | `#C8C3BA` | `--color-border` | Card borders, horizontal rules |
| Highlight | Heather Blush | `#D4A9A0` | `--color-blush` | Tags, gentle highlights |
| Dark | Crag Dark | `#1E2328` | `--color-dark` | Footer, exhibitor CTA |
| Overlay | Wash Cream | `rgba(237,232,223,0.6)` | `--color-overlay` | Frosted glass effects |

### WASM Brushstroke Palette

The floating brushstroke particles use these Lake District tones (defined in both `wasm/src/lib.rs` and `src/js/wasm-fallback.js`):

| Name | RGB |
|------|-----|
| Mossy Green | `101, 115, 95` |
| Sage | `139, 152, 130` |
| Lake Blue | `82, 108, 122` |
| Slate Water | `107, 142, 158` |
| Warm Stone | `155, 133, 107` |
| Sandstone | `180, 161, 137` |
| Earth Brown | `122, 104, 82` |
| Lichen Grey-Green | `168, 178, 163` |

### Contrast Compliance

All text/background pairings pass WCAG AA:

- `#2C3338` on `#F7F5F0` = **10.8:1** (AAA)
- `#6B6560` on `#F7F5F0` = **4.7:1** (AA)
- `#B8860B` on `#F7F5F0` = **4.6:1** (AA for large text)

## Typography

### Fonts

| Role | Font | Weights | Source |
|------|------|---------|--------|
| Display / Headings | DM Serif Display | 400 | Google Fonts |
| Body / UI | Source Sans 3 | 400, 600 | Google Fonts |

### Type Scale (fluid, mobile-first)

```css
h1 { font-size: clamp(2.25rem, 1.5rem + 3.5vw, 4rem); }
h2 { font-size: clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem); }
h3 { font-size: clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem); }
body { font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); }
```

### Usage

- **DM Serif Display** (`--font-display`): h1–h4, `.display-text`, hero edition label
- **Source Sans 3** (`--font-body`): body text, navigation, buttons, captions, form labels
- Headings use `font-weight: 400` (the serif does the work, bold would be too heavy)
- Body uses `font-weight: 400` for text, `600` for emphasis and UI labels

## Layout

### Container

```css
.container { max-width: 72rem; margin: 0 auto; padding: 0 clamp(1rem, 3vw, 2rem); }
```

### Section Spacing

```css
.section { padding: clamp(3rem, 6vw, 6rem) 0; }
```

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | < 500px | Nav scrolls horizontally, single-column grids |
| Tablet | < 768px | Directions stack vertically, 2-column gallery |
| Desktop | > 768px | Full layout, 3-column gallery, side-by-side directions |

## Components

### Buttons

```html
<a href="#" class="btn btn--primary">Primary Action</a>
<a href="#" class="btn btn--outline">Secondary Action</a>
```

- **Primary** (`.btn--primary`): Bracken Amber background, white text. Hover darkens.
- **Outline** (`.btn--outline`): Transparent with border. Hover turns amber.

### Cards

Three card types, all with soft layered shadows:

- **Category cards** (`.category-card`): Emoji icon, h3 title, description. Auto-fill grid at 220px min.
- **Info cards** (`.info-card`): Icon, h3, text. Auto-fit grid at 240px min.
- **Gallery items** (`.gallery-item`): Image + figcaption. CSS columns masonry at 280px min.

### Shadows

Three levels, all using layered low-alpha shadows:

```css
--shadow-soft:  /* resting state */
--shadow-hover: /* hover/focus state — slightly lifted */
--shadow-frame: /* gallery items — mimics mount/frame */
```

### Poster Carousel

Auto-rotating carousel with CSS flex slides:

- 5-second auto-advance with smooth cubic-bezier transition
- Prev/next buttons with frosted glass background
- Dot indicators with active state (amber, scaled up)
- Touch swipe and keyboard arrow support
- Wraps infinitely in both directions

### Gallery Lightbox

Click any gallery item to open a full-screen overlay:

- Dark backdrop with blur (`rgba(30,35,40,0.92)`)
- Close on click-outside, Escape key, or X button
- Image scales to fit viewport with `object-fit: contain`
- Caption at bottom with title and artist

## Texture & Decoration

### Paper Texture

A fixed `::before` pseudo-element on `body` using an SVG `feTurbulence` filter at 2.5% opacity. Creates a subtle paper grain across the entire page.

### Watercolour Wash Dividers

`.wash-divider` elements between sections use layered colour gradients masked with an SVG fractal noise pattern. Colours reference the accent palette at very low opacity (5–7%).

### Scroll Reveal

`.reveal` class triggers a fade-and-slide-up animation when elements enter the viewport:

- **Modern browsers** (Chrome, Edge, Safari 18+): CSS `animation-timeline: view()` — pure CSS, no JS
- **Fallback** (Firefox): `IntersectionObserver` adds `.visible` class
- **Reduced motion**: All animations disabled via `prefers-reduced-motion: reduce`

## Adding New Sections

To add a new section:

1. Add the HTML in `src/index.html` following the existing pattern:
   ```html
   <section class="section" id="new-section">
     <div class="container">
       <div class="section-header reveal">
         <h2>Section Title</h2>
         <p>Description text</p>
       </div>
       <!-- Section content -->
     </div>
   </section>
   ```
2. Use `section--alt` for the alternating parchment background
3. Add a `<div class="wash-divider"></div>` between sections for the watercolour edge
4. Add a nav link in `<nav class="site-nav">`
5. Use `reveal` class on elements that should animate in on scroll
