# The Eskdale Art Show

Website for the 31st Annual Eskdale Art Show, 23-25 May 2026.

## Editing Content

Non-technical contributors can edit event details and gallery images via [Pages CMS](https://pagescms.org):

1. Visit pagescms.org and sign in with your GitHub account
2. Select the `DreamLab-AI/eskdale-website` repository
3. Edit event details or add gallery images through the form interface
4. Changes are saved automatically and deployed within minutes

## Development

```bash
# Serve locally
cd src && python3 -m http.server 8765

# Build WASM module (requires Rust + wasm-pack)
cd wasm && wasm-pack build --target web --release --no-typescript --out-dir ../src/wasm/pkg
```

## Structure

```
src/              Website files (deployed to GitHub Pages)
  index.html      Main page
  css/style.css   Design system
  js/main.js      Data loading, gallery, countdown
  data/           JSON content (edited via CMS)
  assets/         Images, icons
  wasm/pkg/       Built WASM brushstroke effect
wasm/             Rust source for WASM particle system
docs/             PRD, ADR, DDD documentation
.pages.yml        CMS configuration
```

## Deployment

Pushes to `main` trigger GitHub Actions which builds the WASM module and deploys `src/` to GitHub Pages.
