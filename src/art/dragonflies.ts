// Background art for 2026 Q4: dragonflies that hover, then dart somewhere new.
// Same art as remyanddoug.com (art/dragonflies.js). Each quarter gets a new file here.

export interface Critter {
  size: number;
  cruise: number;
  depth: number;
  ph: number;
  x: number;
  y: number;
  dir: number;
  goal: number;
  mode: 'hover' | 'dart';
  timer: number;
  v: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export const ART = {
  name: 'Dragonflies',
  season: '2026 Q4',

  /** Phones get a few, kept small. */
  population(W: number): Critter[] {
    return [210, 180, 90].map((s) => ({
      size: s * Math.min(1, W / 400),
      cruise: rnd(45, 70),
      depth: s > 120 ? rnd(0.6, 0.9) : rnd(0.3, 0.45),
      ph: rnd(0, 9),
      x: 0, y: 0, dir: 0, goal: 0, mode: 'hover', timer: 0, v: 0,
    }));
  },

  spawn(c: Critter, W: number, H: number, fresh: boolean) {
    const ltr = Math.random() < 0.5;
    c.dir = c.goal = (ltr ? 0 : Math.PI) + rnd(-0.6, 0.6);
    c.mode = 'hover'; c.timer = rnd(0.5, 4); c.v = 4;
    if (fresh) { c.x = rnd(0, W); c.y = rnd(0, H); }
    else { c.x = ltr ? -c.size * 0.6 : W + c.size * 0.6; c.y = rnd(H * 0.1, H * 0.9); c.mode = 'dart'; c.timer = 2; }
  },

  move(c: Critter, dt: number, t: number, W: number, H: number) {
    c.timer -= dt;
    if (c.timer <= 0) {
      if (c.mode === 'hover') {
        c.mode = 'dart'; c.timer = rnd(0.9, 1.6);
        const far = Math.hypot(c.x - W / 2, c.y - H / 2) > Math.max(W, H) * 0.38;
        c.goal = far && Math.random() < 0.7 ? Math.atan2(H / 2 - c.y, W / 2 - c.x) + rnd(-0.8, 0.8) : c.dir + rnd(-1.2, 1.2);
      } else { c.mode = 'hover'; c.timer = rnd(2.5, 6); }
    }
    c.v += ((c.mode === 'dart' ? c.cruise : 4) - c.v) * Math.min(1, dt * 2.4);
    c.dir += ((((c.goal - c.dir) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 2.5);
    c.x += Math.cos(c.dir) * c.v * dt;
    c.y += Math.sin(c.dir) * c.v * dt + Math.sin(t * 1.4 + c.ph) * 4 * dt;
  },

  /** Local coords: u runs head(+1) to tail(-1), v across the body. Returns 0..1 darkness. */
  shape(u: number, v: number, time: number, ph: number) {
    const av = Math.abs(v);
    let d = 0;
    const hu = u - 0.86, ev = av - 0.05;
    if (hu * hu + ev * ev < 0.0045) d = 1;
    if (u > 0.5 && u < 0.84) { const x = (u - 0.67) / 0.17; const hw = 0.085 * Math.sqrt(Math.max(0, 1 - x * x)); if (av < hw) d = 1; }
    if (u <= 0.52 && u > -1) {
      const hw = 0.042 - (0.52 - u) * 0.009 + (u < -0.86 ? 0.014 : 0);
      if (av < hw) d = Math.max(d, Math.sin(u * 40) > -0.3 ? 0.95 : 0.55);
    }
    // Two pairs of long wings with a slight shimmer.
    const span = 1 + 0.035 * Math.sin(time * 34 + ph);
    const s = av / span;
    if (s > 0.03 && s < 1) {
      const e = Math.sqrt(Math.max(0, 1 - Math.pow(2 * s - 1, 2)));
      const fc = 0.66 + 0.03 * s - 0.08 * s * s, fh = 0.02 + 0.1 * e;
      const hc = 0.4 - 0.1 * s, hh = 0.025 + 0.12 * e;
      const w = Math.max(0, 1 - Math.abs(u - fc) / fh, 1 - Math.abs(u - hc) / hh);
      if (w > 0) {
        const spot = s > 0.82 && s < 0.9 && w > 0.3 ? 0.9 : 0;
        d = Math.max(d, spot, (0.3 + 0.4 * (1 - w)) * (0.85 + 0.15 * Math.sin(s * 32)));
      }
    }
    return d;
  },
};
