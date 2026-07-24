// Small pure-math helpers used throughout the engine.

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo), hi);

export const round = (v: number, decimals = 2): number => {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
};

export const roundUp = (v: number, decimals = 2): number => {
  const f = Math.pow(10, decimals);
  return Math.ceil(v * f) / f;
};

export const cosDeg = (deg: number): number => Math.cos((deg * Math.PI) / 180);
export const sinDeg = (deg: number): number => Math.sin((deg * Math.PI) / 180);
export const tanDeg = (deg: number): number => Math.tan((deg * Math.PI) / 180);
export const acosDeg = (x: number): number => (Math.acos(clamp(x, -1, 1)) * 180) / Math.PI;
export const asinDeg = (x: number): number => (Math.asin(clamp(x, -1, 1)) * 180) / Math.PI;
export const atanDeg = (y: number, x: number): number => (Math.atan2(y, x) * 180) / Math.PI;

// Temperature-adjusted resistance: R(T) = R20 * (1 + α·(T - 20))
export const resistanceAt = (r20: number, alpha: number, t: number): number =>
  r20 * (1 + alpha * (t - 20));

// Solve cubic x^3 + ax^2 + bx + c = 0
export function solveCubic(a: number, b: number, c: number): number {
  // Cardano's method
  const p = (3 * b - a * a) / 3;
  const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
  const disc = q * q / 4 + p * p * p / 27;
  if (disc > 0) {
    const sd = Math.sqrt(disc);
    const u = Math.cbrt(-q / 2 + sd);
    const v = Math.cbrt(-q / 2 - sd);
    return u + v - a / 3;
  }
  // one real root
  const r = Math.sqrt(-p * p * p / 27);
  const phi = Math.acos(-q / (2 * r));
  const t = 2 * Math.cbrt(r);
  const x1 = t * Math.cos(phi / 3) - a / 3;
  return x1;
}
