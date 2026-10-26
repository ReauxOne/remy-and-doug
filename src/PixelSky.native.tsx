import { Canvas, matchFont, Picture, Skia, SkPicture } from '@shopify/react-native-skia';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { ART, Critter } from './art/dragonflies';
import { useTheme } from './ui';

const GLYPHS = ['+', ':', '*', '#', '%', '=', '3', '7'];
const FRAME = 1000 / 30; // 30 frames a second is plenty for pixel art and saves battery.
const CELL = 7;

/** The website's pixel dragonflies, drawn behind the home screen. */
export default function PixelSky() {
  const t = useTheme();
  const { width: W, height: H } = useWindowDimensions();
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const ink = useRef(t.ink);
  ink.current = t.ink;

  useEffect(() => {
    const cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL);
    const grid = new Float32Array(cols * rows);
    const critters: Critter[] = ART.population(W);
    critters.forEach((c) => ART.spawn(c, W, H, true));
    const paint = Skia.Paint();
    const font = matchFont({ fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: CELL });
    let specks: { x: number; y: number; life: number; a: number }[] = [];
    let t0 = 0, last = Date.now(), raf = 0, running = true, still = false;

    const step = (dt: number) => {
      t0 += dt;
      for (const c of critters) {
        ART.move(c, dt, t0, W, H);
        const m = c.size * 0.8;
        if (c.x < -m || c.x > W + m || c.y < -m || c.y > H + m) ART.spawn(c, W, H, false);
        if (Math.random() < dt * 0.9) {
          const back = c.size * 0.5;
          specks.push({ x: c.x - Math.cos(c.dir) * back + (Math.random() - 0.5) * 20, y: c.y - Math.sin(c.dir) * back + (Math.random() - 0.5) * 20, life: 1, a: c.depth });
        }
      }
      for (const s of specks) s.life -= dt * 0.35;
      specks = specks.filter((s) => s.life > 0);
    };

    const render = () => {
      for (let i = 0; i < grid.length; i++) grid[i] *= 0.8;
      for (const c of critters) {
        const half = c.size / 2, R = c.size * 0.75;
        const cos = Math.cos(c.dir), sin = Math.sin(c.dir);
        const x0 = Math.max(0, Math.floor((c.x - R) / CELL)), x1 = Math.min(cols - 1, Math.ceil((c.x + R) / CELL));
        const y0 = Math.max(0, Math.floor((c.y - R) / CELL)), y1 = Math.min(rows - 1, Math.ceil((c.y + R) / CELL));
        for (let gy = y0; gy <= y1; gy++) {
          for (let gx = x0; gx <= x1; gx++) {
            const dx = (gx + 0.5) * CELL - c.x, dy = (gy + 0.5) * CELL - c.y;
            const d = ART.shape((dx * cos + dy * sin) / half, (-dx * sin + dy * cos) / half, t0, c.ph) * c.depth;
            const i = gy * cols + gx;
            if (d > grid[i]) grid[i] = d;
          }
        }
      }
      for (const s of specks) {
        const gx = Math.floor(s.x / CELL), gy = Math.floor(s.y / CELL);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) grid[gy * cols + gx] = Math.max(grid[gy * cols + gx], 0.28 * s.life * s.a);
      }

      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, W, H));
      paint.setColor(Skia.Color(ink.current));
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const g = grid[gy * cols + gx];
          if (g < 0.04) continue;
          const px = gx * CELL, py = gy * CELL;
          const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
          // Kept lighter than the website so the buttons stay easy to read.
          if (g < 0.3) {
            const sz = Math.max(1, (CELL - 1) * g * 2.4);
            paint.setAlphaf((0.25 + g) * 0.6);
            canvas.drawRect(Skia.XYWHRect(px + (CELL - sz) / 2, py + (CELL - sz) / 2, sz, sz), paint);
          } else if (hash % 9 === 0 && g < 0.8) {
            paint.setAlphaf(g * 0.15);
            canvas.drawRect(Skia.XYWHRect(px, py, CELL - 1, CELL - 1), paint);
            paint.setAlphaf(g * 0.55);
            canvas.drawText(GLYPHS[(hash >>> 4) % GLYPHS.length], px + 1, py + CELL - 1, paint, font);
          } else {
            paint.setAlphaf(g * 0.5);
            canvas.drawRect(Skia.XYWHRect(px, py, CELL - 1, CELL - 1), paint);
          }
        }
      }
      setPicture(recorder.finishRecordingAsPicture());
    };

    const frame = () => {
      if (!running || still) return;
      raf = requestAnimationFrame(frame);
      const now = Date.now();
      if (now - last < FRAME - 2) return;
      step(Math.min(0.1, (now - last) / 1000));
      last = now;
      render();
    };

    const settle = () => {
      for (let i = 0; i < 6; i++) { step(0.016); render(); }
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = Date.now();
      if (still) settle(); else raf = requestAnimationFrame(frame);
    };

    // Respect Reduce Motion, and stop drawing whenever the app is in the background.
    AccessibilityInfo.isReduceMotionEnabled().then((r) => { still = r; start(); });
    const motionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', (r) => { still = r; start(); });
    const appSub = AppState.addEventListener('change', (s) => {
      running = s === 'active';
      if (running) start(); else cancelAnimationFrame(raf);
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      motionSub.remove();
      appSub.remove();
    };
  }, [W, H]);

  if (!picture) return null;
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
