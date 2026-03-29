# Product Requirements Document: Eskdale Art Show Website

## 1. Overview

A modern, accessible static website for the 31st Annual Eskdale Art Show (23–25 May 2026), deployed via GitHub Pages with GitHub Actions CI/CD. The site replaces the legacy ~2005-era page at eskdale.info/art.html.

## 2. Problem Statement

The current site is a fixed-width, non-responsive page built with deprecated DHTML techniques. It fails on mobile devices, lacks accessibility, and cannot be maintained by non-technical community members. The art show deserves a presentation quality that matches the calibre of work exhibited.

## 3. Target Users

| User | Needs |
|------|-------|
| **Visitors** | Event dates, location, directions, what to expect, gallery preview |
| **Exhibiting Artists** | Contact info for submissions, event logistics |
| **Community Art Leads** | Ability to update content (dates, images, text) without developer assistance |
| **Contributors** | Clean, maintainable codebase they can PR against |

## 4. Functional Requirements

### 4.1 Content Sections
- **Hero**: Event name, dates, countdown timer, WASM brushstroke animation overlay
- **About**: 31st annual show description, community event positioning
- **What to See**: Category cards (paintings, pottery, jewellery, woodwork, photographs, etc.)
- **Gallery**: Masonry image grid with lightbox, loaded from JSON data
- **Visit**: Venue address, map embed, railway/transport info, parking
- **Refreshments**: Home-made refreshments callout
- **Contact**: Phone, email, social links (Facebook, Twitter)
- **Footer**: Copyright, eskdale.info link

### 4.2 CMS Integration
- Pages CMS (pagescms.org) for non-technical content editing
- Structured JSON data files for event details, gallery items, about text
- Image upload support via CMS interface
- Contributors authenticate via GitHub account

### 4.3 WASM Visual Effect
- Floating brushstroke particles rendered on canvas overlay
- Lake District colour palette (earth tones, lake blues, fell greens)
- Progressive enhancement: page fully functional without WASM
- Disabled on `prefers-reduced-motion: reduce`
- Reduced particle count on mobile
- Paused when hero section scrolls out of viewport

### 4.4 Responsive Design
- Mobile-first CSS with breakpoints at 400px, 768px, 1024px
- Sticky navigation with smooth scroll anchors
- Touch-friendly tap targets (minimum 44px)
- Images served with `loading="lazy"` and `srcset` where appropriate

### 4.5 Accessibility
- Semantic HTML5 elements throughout
- WCAG AA colour contrast compliance
- `aria-hidden="true"` on decorative canvas
- Alt text on all meaningful images
- Keyboard navigation support
- Skip-to-content link

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| First Contentful Paint | < 1.5s |
| WASM module size | < 30KB (uncompressed) |
| Total page weight | < 500KB (excl. gallery images) |
| Browser support | Last 2 versions of Chrome, Firefox, Safari, Edge |

## 6. Technical Stack

| Component | Technology |
|-----------|-----------|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS with custom properties |
| Scripting | Vanilla ES modules (no framework) |
| Visual Effect | Rust → wasm-pack → Canvas2D |
| CMS | Pages CMS (pagescms.org) |
| Fonts | DM Serif Display + Source Sans 3 (Google Fonts) |
| Deployment | GitHub Actions → GitHub Pages |
| Hosting | GitHub Pages (DreamLab-AI/eskdale-website) |

## 7. Success Metrics

- Site loads and renders correctly on mobile and desktop
- Community art leads can update event details and gallery via Pages CMS
- WASM effect loads without blocking page render
- All content from the current site is preserved and enhanced
- Contributors can make PRs with simple HTML/CSS/JSON edits

## 8. Out of Scope (v1)

- Custom domain configuration (deferred)
- Artist submission forms
- E-commerce / ticket sales
- Multi-language support
- Analytics integration
