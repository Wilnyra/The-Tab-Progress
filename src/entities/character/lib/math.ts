import type { Point } from '../model/types'

export const clampDay = (n: number): number =>
  Number.isFinite(n) && n > 0 ? Math.floor(n) : 0

export const k = (n: number, tau: number): number =>
  1 - Math.exp(-Math.max(0, n) / tau)

export const r2 = (x: number): number => Math.round(x * 100) / 100

export const cap = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  fill: string,
): string =>
  `<path d="M${r2(x1)} ${r2(y1)} L${r2(x2)} ${r2(y2)}" stroke="${fill}" stroke-width="${r2(w)}" stroke-linecap="round" fill="none"/>`

export const poly = (pts: readonly Point[], fill: string): string =>
  `<path d="M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L')} Z" fill="${fill}"/>`

/** FNV-1a 32-bit. */
export const hashStr = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
  return h >>> 0
}
