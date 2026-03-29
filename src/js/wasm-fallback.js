/**
 * Brushstroke Particle Effect — Pure JS Fallback
 * Used when WASM module is not yet built or unavailable.
 * This provides the same visual effect using Canvas2D directly.
 * Once the Rust WASM module is built, main.js will import it instead.
 */

const PALETTE = [
  [101, 115, 95],   // mossy green
  [139, 152, 130],  // sage
  [82, 108, 122],   // lake blue
  [107, 142, 158],  // slate water
  [155, 133, 107],  // warm stone
  [180, 161, 137],  // sandstone
  [122, 104, 82],   // earth brown
  [168, 178, 163],  // lichen grey-green
];

class Brushstroke {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, initial = false) {
    if (initial) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
    } else {
      // Spawn from edges
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: this.x = -50; this.y = Math.random() * h; break;
        case 1: this.x = w + 50; this.y = Math.random() * h; break;
        case 2: this.x = Math.random() * w; this.y = -50; break;
        case 3: this.x = Math.random() * w; this.y = h + 50; break;
      }
    }

    this.vx = (Math.random() - 0.5) * 25;
    this.vy = (Math.random() - 0.5) * 15 - 5;
    this.rotation = Math.random() * Math.PI * 2;
    this.angularVel = (Math.random() - 0.5) * 0.15;
    this.length = 30 + Math.random() * 50;
    this.width = 8 + Math.random() * 14;
    this.taper = 0.3 + Math.random() * 0.4;
    this.maxOpacity = 0.04 + Math.random() * 0.12;
    this.opacity = 0;
    this.life = 0;
    this.lifetime = 8 + Math.random() * 10;
    this.colorIdx = Math.floor(Math.random() * PALETTE.length);

    // Bezier control point variance for unique shapes
    this.cv = [
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
    ];
  }

  update(dt, w, h) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVel * dt;
    this.life += dt;

    const t = this.life / this.lifetime;
    if (t < 0.2) {
      this.opacity = this.maxOpacity * (t / 0.2);
    } else if (t > 0.8) {
      this.opacity = this.maxOpacity * (1 - (t - 0.8) / 0.2);
    } else {
      this.opacity = this.maxOpacity;
    }

    if (t >= 1.0) {
      this.reset(w, h, false);
    }
  }

  draw(ctx) {
    if (this.opacity <= 0.001) return;

    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const hl = this.length / 2;
    const hw = this.width / 2;

    // Tip points (along length axis)
    const tx1 = this.x + cos * hl;
    const ty1 = this.y + sin * hl;
    const tx2 = this.x - cos * hl;
    const ty2 = this.y - sin * hl;

    // Perpendicular direction
    const px = -sin * hw;
    const py = cos * hw;

    // Control points for two bezier curves (upper and lower)
    const cp1x = this.x + px * this.cv[0] + cos * hl * 0.3 * this.cv[1];
    const cp1y = this.y + py * this.cv[0] + sin * hl * 0.3 * this.cv[1];
    const cp2x = this.x + px * this.cv[2] - cos * hl * 0.3 * this.cv[3];
    const cp2y = this.y + py * this.cv[2] - sin * hl * 0.3 * this.cv[3];

    const cp3x = this.x - px * this.cv[2] + cos * hl * 0.3 * this.cv[3];
    const cp3y = this.y - py * this.cv[2] + sin * hl * 0.3 * this.cv[3];
    const cp4x = this.x - px * this.cv[0] - cos * hl * 0.3 * this.cv[1];
    const cp4y = this.y - py * this.cv[0] - sin * hl * 0.3 * this.cv[1];

    const [r, g, b] = PALETTE[this.colorIdx];

    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.moveTo(tx1, ty1);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx2, ty2);
    ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, tx1, ty1);
    ctx.closePath();
    ctx.fill();
  }
}

let particles = [];
let ctx = null;
let canvasEl = null;
let heroEl = null;
let animId = null;
let lastTime = 0;
let paused = false;
let cachedW = 0;
let cachedH = 0;

function resizeCanvas() {
  if (!canvasEl || !heroEl) return;
  const rect = heroEl.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasEl.width = rect.width * dpr;
  canvasEl.height = rect.height * dpr;
  canvasEl.style.width = rect.width + 'px';
  canvasEl.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cachedW = rect.width;
  cachedH = rect.height;
}

function tick(timestamp) {
  if (paused) return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  ctx.clearRect(0, 0, cachedW, cachedH);

  for (const p of particles) {
    p.update(dt, cachedW, cachedH);
    p.draw(ctx);
  }

  ctx.globalAlpha = 1;
  animId = requestAnimationFrame(tick);
}

export function init(canvas, hero) {
  canvasEl = canvas;
  heroEl = hero;
  ctx = canvas.getContext('2d');

  resizeCanvas();

  const isMobile = matchMedia('(max-width: 768px)').matches;
  const count = isMobile ? 15 : 45;

  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Brushstroke(cachedW, cachedH));
  }

  // Stagger initial life so particles don't all appear at once
  particles.forEach((p, i) => {
    p.life = (i / count) * p.lifetime;
  });

  // Pause when off-screen — cancel rAF to save CPU/battery
  const observer = new IntersectionObserver(([entry]) => {
    const wasPaused = paused;
    paused = !entry.isIntersecting;
    if (paused) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else if (wasPaused) {
      lastTime = performance.now();
      animId = requestAnimationFrame(tick);
    }
  }, { threshold: 0 });
  observer.observe(hero);

  // Resize
  new ResizeObserver(() => {
    resizeCanvas();
  }).observe(hero);

  lastTime = performance.now();
  animId = requestAnimationFrame(tick);
}

export function destroy() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
  particles = [];
}
