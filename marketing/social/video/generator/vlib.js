// vlib.js — tiny deterministic timeline helpers for motion graphics (drive via SEEK(t))
window.V = (function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  // normalized progress of t within [t0,t1]
  const p = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  const lerp = (a, b, u) => a + (b - a) * u;
  const E = {
    linear: u => u,
    out: u => 1 - Math.pow(1 - u, 3),            // cubic ease-out
    outQuint: u => 1 - Math.pow(1 - u, 5),
    inOut: u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
    outBack: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
    outExpo: u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u),
  };
  // exact CSS cubic-bezier sampler (for matching the site's reveal easing)
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = t => ((ax * t + bx) * t + cx) * t;
    const fy = t => ((ay * t + by) * t + cy) * t;
    const dfx = t => (3 * ax * t + 2 * bx) * t + cx;
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-5) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      return fy(Math.min(1, Math.max(0, t)));
    };
  }
  // site's signature reveal easing: cubic-bezier(0.16, 1, 0.3, 1)
  E.web = cubicBezier(0.16, 1, 0.3, 1);
  // tween a value between t0..t1 with easing
  const tw = (t, t0, t1, from, to, ease = E.out) => lerp(from, to, ease(p(t, t0, t1)));
  // fade+rise helper -> returns {opacity, y}
  const rise = (t, t0, dur = 0.6, dist = 40, ease = E.out) => {
    const u = p(t, t0, t0 + dur);
    return { o: u, y: lerp(dist, 0, ease(u)) };
  };
  // apply opacity + translateY(px) + optional scale to an element
  const set = (el, { o = 1, y = 0, x = 0, s = 1 } = {}) => {
    if (!el) return;
    el.style.opacity = o;
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  };
  // typewriter-ish reveal by character count
  const chars = (t, t0, t1, str) => str.slice(0, Math.round(tw(t, t0, t1, 0, str.length, E.linear)));
  // pulse 0..1..0 within window
  const pulse = (t, t0, t1) => { const u = p(t, t0, t1); return Math.sin(u * Math.PI); };
  return { clamp, p, lerp, E, tw, rise, set, chars, pulse };
})();
