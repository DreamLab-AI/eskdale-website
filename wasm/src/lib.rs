use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

const PALETTE: [(u8, u8, u8); 8] = [
    (101, 115, 95),  // mossy green
    (139, 152, 130), // sage
    (82, 108, 122),  // lake blue
    (107, 142, 158), // slate water
    (155, 133, 107), // warm stone
    (180, 161, 137), // sandstone
    (122, 104, 82),  // earth brown
    (168, 178, 163), // lichen grey-green
];

struct Rng(u64);

impl Rng {
    fn new(seed: u64) -> Self {
        Self(seed.wrapping_add(0x9E3779B97F4A7C15))
    }

    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        self.0
    }

    fn f64(&mut self) -> f64 {
        (self.next() >> 11) as f64 / (1u64 << 53) as f64
    }

    fn range(&mut self, lo: f64, hi: f64) -> f64 {
        lo + self.f64() * (hi - lo)
    }
}

struct Brushstroke {
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    rotation: f64,
    angular_vel: f64,
    length: f64,
    width: f64,
    max_opacity: f64,
    opacity: f64,
    life: f64,
    lifetime: f64,
    color_idx: usize,
    cv: [f64; 4],
}

impl Brushstroke {
    fn new_random(rng: &mut Rng, w: f64, h: f64) -> Self {
        Self {
            x: rng.range(0.0, w),
            y: rng.range(0.0, h),
            vx: rng.range(-12.5, 12.5),
            vy: rng.range(-12.5, -2.5),
            rotation: rng.range(0.0, std::f64::consts::TAU),
            angular_vel: rng.range(-0.075, 0.075),
            length: rng.range(30.0, 80.0),
            width: rng.range(8.0, 22.0),
            max_opacity: rng.range(0.04, 0.16),
            opacity: 0.0,
            life: 0.0,
            lifetime: rng.range(8.0, 18.0),
            color_idx: (rng.next() as usize) % PALETTE.len(),
            cv: [
                rng.range(0.8, 1.2),
                rng.range(0.8, 1.2),
                rng.range(0.8, 1.2),
                rng.range(0.8, 1.2),
            ],
        }
    }

    fn respawn(&mut self, rng: &mut Rng, w: f64, h: f64) {
        let side = (rng.next() % 4) as u8;
        match side {
            0 => { self.x = -50.0; self.y = rng.range(0.0, h); }
            1 => { self.x = w + 50.0; self.y = rng.range(0.0, h); }
            2 => { self.x = rng.range(0.0, w); self.y = -50.0; }
            _ => { self.x = rng.range(0.0, w); self.y = h + 50.0; }
        }
        self.vx = rng.range(-12.5, 12.5);
        self.vy = rng.range(-12.5, -2.5);
        self.rotation = rng.range(0.0, std::f64::consts::TAU);
        self.angular_vel = rng.range(-0.075, 0.075);
        self.length = rng.range(30.0, 80.0);
        self.width = rng.range(8.0, 22.0);
        self.max_opacity = rng.range(0.04, 0.16);
        self.opacity = 0.0;
        self.life = 0.0;
        self.lifetime = rng.range(8.0, 18.0);
        self.color_idx = (rng.next() as usize) % PALETTE.len();
        self.cv = [
            rng.range(0.8, 1.2),
            rng.range(0.8, 1.2),
            rng.range(0.8, 1.2),
            rng.range(0.8, 1.2),
        ];
    }

    fn update(&mut self, dt: f64, rng: &mut Rng, w: f64, h: f64) {
        self.x += self.vx * dt;
        self.y += self.vy * dt;
        self.rotation += self.angular_vel * dt;
        self.life += dt;

        let t = self.life / self.lifetime;
        self.opacity = if t < 0.2 {
            self.max_opacity * (t / 0.2)
        } else if t > 0.8 {
            self.max_opacity * (1.0 - (t - 0.8) / 0.2)
        } else {
            self.max_opacity
        };

        if t >= 1.0 {
            self.respawn(rng, w, h);
        }
    }

    fn draw(&self, ctx: &CanvasRenderingContext2d) {
        if self.opacity <= 0.001 {
            return;
        }

        let cos = self.rotation.cos();
        let sin = self.rotation.sin();
        let hl = self.length / 2.0;
        let hw = self.width / 2.0;

        let tx1 = self.x + cos * hl;
        let ty1 = self.y + sin * hl;
        let tx2 = self.x - cos * hl;
        let ty2 = self.y - sin * hl;

        let px = -sin * hw;
        let py = cos * hw;

        let cp1x = self.x + px * self.cv[0] + cos * hl * 0.3 * self.cv[1];
        let cp1y = self.y + py * self.cv[0] + sin * hl * 0.3 * self.cv[1];
        let cp2x = self.x + px * self.cv[2] - cos * hl * 0.3 * self.cv[3];
        let cp2y = self.y + py * self.cv[2] - sin * hl * 0.3 * self.cv[3];
        let cp3x = self.x - px * self.cv[2] + cos * hl * 0.3 * self.cv[3];
        let cp3y = self.y - py * self.cv[2] + sin * hl * 0.3 * self.cv[3];
        let cp4x = self.x - px * self.cv[0] - cos * hl * 0.3 * self.cv[1];
        let cp4y = self.y - py * self.cv[0] - sin * hl * 0.3 * self.cv[1];

        let (r, g, b) = PALETTE[self.color_idx];

        ctx.set_global_alpha(self.opacity);
        ctx.set_fill_style_str(&format!("rgb({},{},{})", r, g, b));
        ctx.begin_path();
        ctx.move_to(tx1, ty1);
        let _ = ctx.bezier_curve_to(cp1x, cp1y, cp2x, cp2y, tx2, ty2);
        let _ = ctx.bezier_curve_to(cp3x, cp3y, cp4x, cp4y, tx1, ty1);
        ctx.close_path();
        ctx.fill();
    }
}

#[wasm_bindgen]
pub struct ParticleSystem {
    particles: Vec<Brushstroke>,
    ctx: CanvasRenderingContext2d,
    width: f64,
    height: f64,
    rng: Rng,
    paused: bool,
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: web_sys::HtmlCanvasElement, is_mobile: bool) -> Result<ParticleSystem, JsValue> {
        let ctx = canvas
            .get_context("2d")?
            .ok_or("No 2d context")?
            .dyn_into::<CanvasRenderingContext2d>()?;

        let w = canvas.width() as f64;
        let h = canvas.height() as f64;
        let count = if is_mobile { 15 } else { 45 };

        let seed = js_sys::Date::now() as u64;
        let mut rng = Rng::new(seed);

        let mut particles = Vec::with_capacity(count);
        for i in 0..count {
            let mut p = Brushstroke::new_random(&mut rng, w, h);
            // Stagger initial life
            p.life = (i as f64 / count as f64) * p.lifetime;
            particles.push(p);
        }

        Ok(ParticleSystem {
            particles,
            ctx,
            width: w,
            height: h,
            rng,
            paused: false,
        })
    }

    pub fn tick(&mut self, dt: f64) {
        if self.paused {
            return;
        }

        let dt = dt.min(0.05);
        self.ctx.clear_rect(0.0, 0.0, self.width, self.height);

        let w = self.width;
        let h = self.height;

        for p in &mut self.particles {
            p.update(dt, &mut self.rng, w, h);
            p.draw(&self.ctx);
        }

        self.ctx.set_global_alpha(1.0);
    }

    pub fn resize(&mut self, w: f64, h: f64) {
        self.width = w;
        self.height = h;
    }

    pub fn pause(&mut self) {
        self.paused = true;
    }

    pub fn resume(&mut self) {
        self.paused = false;
    }
}
