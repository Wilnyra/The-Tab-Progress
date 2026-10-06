// The look: a realistic adult whose clothes, pose and kit get a little more
// "together" every day. Pure and deterministic. Head is always level.
// Colors via CSS variables with fallbacks.
import type {
  FigureState,
  HairStyle,
  Point,
  StreakOptions,
} from '../model/types'
import { cap, clampDay, k, poly, r2 } from './math'

const v = (name: string, fallback: string): string =>
  `hsl(var(--${name}, ${fallback}))`

export const T = {
  skin: v('figure-skin', '24 28% 64%'),
  skinShade: v('figure-skin-shade', '22 26% 55%'),
  hair: v('figure-hair', '24 14% 26%'),
  top0: v('figure-top-0', '215 7% 68%'),
  top0Shade: v('figure-top-0-shade', '215 7% 60%'),
  top1: v('figure-top-1', '205 24% 56%'),
  top1Shade: v('figure-top-1-shade', '205 24% 48%'),
  top2: v('figure-top-2', '198 32% 42%'),
  top2Shade: v('figure-top-2-shade', '198 32% 35%'),
  collar: v('figure-collar', '0 0% 94%'),
  pants0: v('figure-pants-0', '220 5% 54%'),
  pants0Shade: v('figure-pants-0-shade', '220 5% 47%'),
  pants1: v('figure-pants-1', '222 14% 30%'),
  pants1Shade: v('figure-pants-1-shade', '222 14% 25%'),
  crease: v('figure-crease', '222 10% 40%'),
  shoeOld: v('figure-shoe-old', '220 4% 58%'),
  shoeWhite: v('figure-shoe-white', '0 0% 97%'),
  shoeSole: v('figure-shoe-sole', '220 6% 72%'),
  shoeLeather: v('figure-shoe-leather', '24 32% 30%'),
  lace: v('figure-lace', '220 5% 40%'),
  sock: v('figure-sock', '38 55% 60%'),
  belt: v('figure-belt', '220 8% 22%'),
  beltLeather: v('figure-belt-leather', '24 40% 32%'),
  jacket0: v('figure-jacket-0', '35 18% 58%'),
  jacket0Shade: v('figure-jacket-0-shade', '35 18% 50%'),
  jacket1: v('figure-jacket-1', '28 22% 34%'),
  jacket1Shade: v('figure-jacket-1-shade', '28 22% 28%'),
  bag: v('figure-bag', '28 14% 30%'),
  pack: v('figure-pack', '200 8% 38%'),
  bottle: v('figure-bottle', '190 18% 62%'),
  bottleCap: v('figure-bottle-cap', '190 12% 36%'),
  notebook: v('figure-notebook', '38 30% 78%'),
  notebookEdge: v('figure-notebook-edge', '38 20% 60%'),
  dark: v('figure-dark', '220 10% 18%'),
  white: v('figure-white', '0 0% 98%'),
  metal: v('figure-metal', '210 8% 70%'),
  chain: v('figure-chain', '42 35% 66%'),
  accent: 'hsl(var(--primary, 240 5.9% 10%))',
  floor: 'hsl(var(--border, 240 5.9% 90%))',
  ghost: 'hsl(var(--muted-foreground, 240 3.8% 46.1%))',
} as const

export type ColorKey = keyof typeof T
export type ColorFn = (key: ColorKey) => string
export type TopKey = 'top0' | 'top1' | 'top2'
export type JacketKey = 'jacket0' | 'jacket1'
export type PantsKey = 'pants0' | 'pants1'
type Shadeable = TopKey | JacketKey | PantsKey | 'skin'

export const shadeOf = <K extends Shadeable>(key: K): `${K}Shade` =>
  `${key}Shade`

export const TOP_KEYS: readonly [TopKey, TopKey, TopKey] = [
  'top0',
  'top1',
  'top2',
]

export const pantsKeyOf = (s: FigureState): PantsKey =>
  s.trousers === 'joggers' || s.trousers === 'straight' ? 'pants0' : 'pants1'

const CX = 60

// Look (clothes, grooming, kit) is earned: driven by the best streak and
// kept after a break. Pose and posture are "today": E = max(streak, best/2).
export const getState = (
  streakDays: number,
  opts: StreakOptions = {},
): FigureState => {
  const n = clampDay(streakDays)
  const best = Math.max(n, clampDay(opts.bestStreak ?? n))
  const resting = n === 0 && best > 0
  const e = Math.max(n, Math.round(best * 0.5))
  const g = best // gear day
  const pose = resting
    ? 'seated'
    : e < 7
      ? 'pockets'
      : e < 9
        ? 'relaxed'
        : e < 21
          ? 'bottle'
          : e < 42
            ? 'crossed'
            : e < 90
              ? 'pocketOne'
              : e < 105
                ? 'hips'
                : e < 330
                  ? 'overShoulder'
                  : e < 365
                    ? 'relaxed'
                    : 'open'
  return {
    n,
    best,
    resting,
    pose,
    // shoulders back, chest open
    posture: r2((0.4 * Math.min(e, 7)) / 7 + 0.6 * k(e - 7, 30)),
    evenWeight: e >= 29,
    body: r2(k(Math.max(0, e - 28), 120)),
    laces: g >= 1,
    hair:
      g >= 35
        ? 'full'
        : g >= 20
          ? 'styled'
          : g >= 14
            ? 'cut'
            : g >= 2
              ? 'combed'
              : 'messy',
    sleeves: g >= 12 ? 'short' : g >= 3 ? 'pushed' : 'long',
    smooth: g >= 4,
    keys: g >= 11,
    tuck: g >= 12 ? 'full' : g >= 5 ? 'front' : 'none',
    belt: g >= 240 ? 'leather' : g >= 6 ? 'plain' : null,
    watch: g >= 56 ? 'metal' : g >= 8 ? 'basic' : null,
    bottle: g >= 9,
    trousers:
      g >= 270
        ? 'pressed'
        : g >= 49
          ? 'tapered'
          : g >= 23
            ? 'dark'
            : g >= 10
              ? 'straight'
              : 'joggers',
    fitted: g >= 12,
    wristband: g >= 66 ? 'leather' : g >= 13 ? 'band' : null,
    shoes: g >= 210 ? 'leather' : g >= 15 ? 'white' : 'old',
    stripe: g >= 22 && g < 210,
    crossbody: g >= 16 && g < 75,
    backpack: g >= 75,
    bagHigh: g >= 17,
    cuffs: g >= 18,
    top: g >= 180 ? 2 : g >= 19 ? 1 : 0,
    necklace: g >= 24,
    neckline: g >= 120 ? 'collar' : g >= 25 ? 'henley' : 'crew',
    notebook: g >= 26,
    socks: g >= 27,
    headphones: g >= 28,
    jacket:
      g >= 330 ? 'worn' : g >= 105 ? 'shoulder' : g >= 30 ? 'waist' : null,
    jacketTone: g >= 150 ? 1 : 0,
    pen: g >= 300,
  }
}

export const drawShoe = (
  s: FigureState,
  c: ColorFn,
  x: number,
  sg: number,
): string => {
  const key: ColorKey =
    s.shoes === 'leather'
      ? 'shoeLeather'
      : s.shoes === 'white'
        ? 'shoeWhite'
        : 'shoeOld'
  let out = `<rect x="${r2(x - 3.9 + sg * 0.6)}" y="145.4" width="7.8" height="4.6" rx="2.3" fill="${c(key)}"/>`
  if (s.shoes === 'white')
    out += `<rect x="${r2(x - 3.9 + sg * 0.6)}" y="148.6" width="7.8" height="1.4" rx="0.7" fill="${c('shoeSole')}"/>`
  if (s.stripe)
    out += `<path d="M${r2(x - 2 + sg * 0.6)} 148 L${r2(x + 1.6 + sg * 0.6)} 146.4" stroke="${c('accent')}" stroke-width="1" stroke-linecap="round"/>`
  if (!s.laces)
    out += `<path d="M${r2(x + sg * 0.6)} 146 q${sg * 2} 2 ${sg * 4.6} 3.6 M${r2(x + sg * 0.6)} 146 q${sg * 1} 2.4 ${sg * 2.2} 4" stroke="${c('lace')}" stroke-width="0.6" fill="none" stroke-linecap="round"/>`
  return out
}

export const drawHair = (
  style: HairStyle,
  x: number,
  y: number,
  fill: string,
): string => {
  const capPath = (side: number, top: number, front: number): string =>
    `M${r2(x - 7.1)} ${r2(y + side)} C${r2(x - 7.6)} ${r2(y - top)} ${r2(x + 7.6)} ${r2(y - top)} ${r2(x + 7.1)} ${r2(y + side)} ` +
    `Q${r2(x + 4)} ${r2(y - front - 1)} ${r2(x)} ${r2(y - front)} Q${r2(x - 4.5)} ${r2(y - front + 0.4)} ${r2(x - 7.1)} ${r2(y + side)} Z`
  switch (style) {
    case 'messy':
      return `<path d="${capPath(-1.4, 12.6, 4.2)}" fill="${fill}"/><path d="M${r2(x - 5)} ${r2(y - 7.6)} l-2 -2.6 l3 0.8 Z M${r2(x + 1)} ${r2(y - 9.4)} l0.6 -3 l1.8 2.6 Z M${r2(x + 5.4)} ${r2(y - 6.8)} l2.6 -1.8 l-0.8 3 Z" fill="${fill}"/>`
    case 'combed':
      return `<path d="${capPath(-1.4, 12.2, 4)}" fill="${fill}"/>`
    case 'cut':
      return `<path d="${capPath(-3.4, 12.2, 4.4)}" fill="${fill}"/>`
    case 'styled':
      return `<path d="${capPath(-3.4, 13.2, 4.8)}" fill="${fill}"/><path d="M${r2(x - 3)} ${r2(y - 8.4)} Q${r2(x + 1)} ${r2(y - 12.6)} ${r2(x + 5.4)} ${r2(y - 8)} Z" fill="${fill}"/>`
    case 'full':
      return `<path d="${capPath(-3.2, 14.2, 5)}" fill="${fill}"/><path d="M${r2(x - 4)} ${r2(y - 8.6)} Q${r2(x + 1)} ${r2(y - 14)} ${r2(x + 6.2)} ${r2(y - 8.2)} Z" fill="${fill}"/>`
    default: {
      const unreachable: never = style
      return unreachable
    }
  }
}

type ArmTarget = {
  e: Point
  w: Point
  hand: boolean
  holds?: 'bottle'
  cross?: boolean
  hips?: boolean
}

/** Static (unrigged) figure: seated rest, ghost outline, future self. */
export const drawFigure = (s: FigureState, mono: string | null): string => {
  const c: ColorFn = (key) => (mono ? mono : T[key])
  const u = 1 - s.posture
  const b = s.body
  const seated = s.pose === 'seated'
  const dy = seated ? 40 : 0
  // hips shifted over the standing leg
  const shift = s.evenWeight || seated ? 0 : 1.8

  const hcy = 21 + dy
  const sy = 38 + 0.8 * u + dy
  const droop = 2 * u
  const sw = 13.2 + 2.2 * b - 1.0 * u
  const loose = !s.fitted
  const ww = 10.6 - 1.1 * b + (loose ? 1.4 : 0)
  const hw = 11.2
  const nw = 5.4 + 0.9 * b
  const aw = 4.1 + 0.8 * b
  const hipY = 82 + dy
  const tx = CX - shift // torso centre
  const topKey = TOP_KEYS[s.top]
  const top = c(topKey)
  const topShade = c(shadeOf(topKey))
  const jk: JacketKey = s.jacketTone ? 'jacket1' : 'jacket0'
  const pantsKey = pantsKeyOf(s)
  const out: string[] = []

  // ---- arm geometry per pose ----
  const shL: Point = [tx - sw + 2.2, sy + 3.4 + droop]
  const shR: Point = [tx + sw - 2.2, sy + 3.4 + droop]
  const arm = (side: 'L' | 'R'): ArmTarget => {
    const sg = side === 'L' ? -1 : 1
    const relaxed: ArmTarget = {
      e: [tx + sg * (sw + 0.9), 63 + dy],
      w: [tx + sg * (sw + 0.4), 86 + dy],
      hand: true,
    }
    const pocket: ArmTarget = {
      e: [tx + sg * (sw + 0.6), 63 + dy],
      w: [tx + sg * (hw - 2.6), 83 + dy],
      hand: false,
    }
    switch (s.pose) {
      case 'pockets':
        return pocket
      case 'bottle':
        return side === 'R'
          ? {
              e: [tx + sw + 1.4, 63],
              w: [tx + sw + 3.4, 81],
              hand: true,
              holds: 'bottle',
            }
          : relaxed
      case 'crossed':
        return side === 'L'
          ? {
              e: [tx - sw - 1.6, 60],
              w: [tx + 7.5, 58.5],
              hand: true,
              cross: true,
            }
          : {
              e: [tx + sw + 1.6, 61],
              w: [tx - 7.5, 60.5],
              hand: true,
              cross: true,
            }
      case 'pocketOne':
        return side === 'R' ? pocket : relaxed
      case 'hips':
        return {
          e: [tx + sg * (sw + 6.5), 60],
          w: [tx + sg * (ww + 1.2), 72],
          hand: true,
          hips: true,
        }
      case 'overShoulder':
        return side === 'R'
          ? { e: [tx + sw + 4.5, 55], w: [tx + sw - 1.5, sy - 1], hand: true }
          : relaxed
      case 'open':
        return {
          e: [tx + sg * (sw + 1.8), 63],
          w: [tx + sg * (sw + 2.6), 85],
          hand: true,
        }
      case 'seated':
        return {
          e: [tx + sg * (sw + 1), 63 + dy],
          w: [tx + sg * 8.5, hipY + 6],
          hand: true,
        }
      default:
        return relaxed
    }
  }

  // ---- behind the body ----
  if (s.backpack && !seated) {
    out.push(
      `<rect x="${r2(tx - sw - 4.5)}" y="${r2(sy + 3)}" width="9" height="22" rx="3.5" fill="${c('pack')}"/>`,
    )
  }
  if (s.jacket === 'shoulder' && !seated) {
    out.push(
      poly(
        [
          [tx + sw - 4, sy - 1.5],
          [tx + sw + 1.5, sy - 2],
          [tx + sw + 5.5, 72],
          [tx + sw - 0.5, 74],
        ],
        c(jk),
      ),
    )
  }
  if (s.jacket === 'waist' && !seated) {
    out.push(
      poly(
        [
          [tx - hw - 1.5, hipY - 3],
          [tx + hw + 1.5, hipY - 3],
          [tx + hw + 3, hipY + 14],
          [tx - hw - 3, hipY + 14],
        ],
        c(shadeOf(jk)),
      ),
    )
  }

  // ---- legs ----
  if (seated) {
    for (const sg of [-1, 1]) {
      const kx = CX + sg * 6.2
      const pk = c(sg < 0 ? pantsKey : shadeOf(pantsKey))
      out.push(
        poly(
          [
            [CX + sg * hw, hipY - 2],
            [CX + sg * 0.3, hipY - 2],
            [kx - sg * 4.4, hipY + 7],
            [kx + sg * 4.6, hipY + 7],
          ],
          pk,
        ),
      )
      out.push(
        poly(
          [
            [kx - 4.6, hipY + 5],
            [kx + 4.6, hipY + 5],
            [kx + 3.2, 143],
            [kx - 3.2, 143],
          ],
          pk,
        ),
      )
      out.push(drawShoe(s, c, kx, sg))
    }
  } else {
    const fd = s.evenWeight ? 5.6 + 1.6 * b : 4.6
    for (const sg of [-1, 1]) {
      const standing = sg < 0 // weight on the left leg until day 29
      const fx = CX + sg * fd + (!s.evenWeight && !standing ? 1.6 : 0)
      const outer = tx + sg * hw
      const kneeIn = !s.evenWeight && !standing ? -1.6 : 0
      const kx = (outer + fx) / 2 + kneeIn
      const ank =
        s.trousers === 'joggers'
          ? 2.6
          : s.trousers === 'tapered' || s.trousers === 'pressed'
            ? 2.7
            : 3.2
      const hem = s.cuffs ? 141 : 146
      const pk = c(sg < 0 ? pantsKey : shadeOf(pantsKey))
      out.push(
        poly(
          [
            [outer, hipY],
            [tx + sg * 0.3, hipY],
            [tx + sg * 0.3, hipY + 7],
            [kx - sg * 3.2, 113],
            [fx - sg * ank, hem],
            [fx + sg * (ank + 0.4), hem],
            [kx + sg * 4.4, 113],
          ],
          pk,
        ),
      )
      if (s.trousers === 'joggers')
        out.push(
          `<rect x="${r2(fx - 3.2)}" y="142" width="6.4" height="3.6" rx="1.2" fill="${c(shadeOf(pantsKey))}"/>`,
        )
      if (s.cuffs) {
        out.push(
          `<rect x="${r2(fx - ank - 0.6)}" y="139.6" width="${r2(2 * ank + 1.2)}" height="2.4" rx="0.6" fill="${c(shadeOf(pantsKey))}"/>`,
        )
        out.push(
          `<rect x="${r2(fx - 2.2)}" y="142" width="4.4" height="4" fill="${c(s.socks ? 'sock' : 'skinShade')}"/>`,
        )
      }
      if (s.trousers === 'pressed' && !mono)
        out.push(
          `<path d="M${r2((outer + tx) / 2)} ${hipY + 3} L${r2(kx)} 113 L${r2(fx)} ${hem - 2}" stroke="${c('crease')}" stroke-width="0.6" fill="none"/>`,
        )
      out.push(drawShoe(s, c, fx, sg))
    }
  }

  // ---- things set down by the feet ----
  if (!seated && s.bottle && s.pose !== 'bottle') {
    out.push(
      `<rect x="${CX + 19}" y="136" width="5" height="14" rx="1.6" fill="${c('bottle')}"/><rect x="${CX + 19.6}" y="133.6" width="3.8" height="3" rx="0.8" fill="${c('bottleCap')}"/>`,
    )
  }
  if (!seated && s.notebook) {
    out.push(
      `<rect x="${CX + 26}" y="146.2" width="10" height="3.8" rx="0.6" fill="${c('notebook')}"/><rect x="${CX + 26}" y="148.6" width="10" height="1.4" fill="${c('notebookEdge')}"/>`,
    )
  }
  if (seated) {
    // stuff beside the person on the step
    if (s.backpack)
      out.push(
        `<rect x="${CX + 18}" y="109" width="11" height="13" rx="3.5" fill="${c('pack')}"/>`,
      )
    else if (s.crossbody)
      out.push(
        `<rect x="${CX + 18}" y="114" width="9" height="8" rx="2" fill="${c('bag')}"/>`,
      )
    if (s.bottle)
      out.push(
        `<rect x="${CX + 31}" y="109" width="4.6" height="13" rx="1.5" fill="${c('bottle')}"/>`,
      )
    if (s.notebook)
      out.push(
        `<rect x="${CX - 32}" y="118.6" width="10" height="3.4" rx="0.6" fill="${c('notebook')}"/>`,
      )
    if (s.jacket)
      out.push(
        poly(
          [
            [CX - 30, 122],
            [CX - 16, 122],
            [CX - 18, 116],
            [CX - 28, 117],
          ],
          c(jk),
        ),
      )
  }

  // ---- neck ----
  out.push(
    `<rect x="${r2(tx - nw / 2)}" y="${r2(hcy + 5)}" width="${r2(nw)}" height="${r2(sy - hcy - 3)}" fill="${c('skinShade')}"/>`,
  )

  // ---- belt (visible where the top is tucked) ----
  if (s.belt && s.tuck !== 'none') {
    out.push(
      `<rect x="${r2(tx - hw - 0.2)}" y="${hipY - 2.2}" width="${r2(2 * hw + 0.4)}" height="3" fill="${c(s.belt === 'leather' ? 'beltLeather' : 'belt')}"/>`,
    )
    if (!mono)
      out.push(
        `<rect x="${r2(tx - 1.6)}" y="${hipY - 2.4}" width="3.2" height="3.4" rx="0.4" fill="none" stroke="${c('metal')}" stroke-width="0.7"/>`,
      )
  }

  // ---- torso ----
  const t0 = sy - 1.2
  const hemY =
    s.tuck === 'none' ? hipY + 6 : s.tuck === 'front' ? hipY + 3.5 : hipY - 2.2
  const hemW = s.tuck === 'none' ? hw + 2.6 : s.tuck === 'front' ? hw + 1.6 : hw
  const hemMid = s.tuck === 'front' ? hipY - 2.2 : hemY
  const torso =
    `M${r2(tx - 4.4)} ${r2(t0)} C${r2(tx - 9)} ${r2(t0)} ${r2(tx - sw + 1)} ${r2(sy - 0.4 + droop * 0.4)} ${r2(tx - sw)} ${r2(sy + 2.6 + droop)} ` +
    `L${r2(tx - sw + 2.4)} ${r2(sy + 13)} Q${r2(tx - ww - 0.6)} ${r2(64 + dy)} ${r2(tx - ww)} ${r2(71 + dy)} L${r2(tx - hemW)} ${r2(hemY)} ` +
    `Q${r2(tx)} ${r2(hemMid + (s.tuck === 'front' ? -1 : 0))} ${r2(tx + hemW)} ${r2(hemY)} L${r2(tx + ww)} ${r2(71 + dy)} Q${r2(tx + ww + 0.6)} ${r2(64 + dy)} ${r2(tx + sw - 2.4)} ${r2(sy + 13)} ` +
    `L${r2(tx + sw)} ${r2(sy + 2.6 + droop)} C${r2(tx + sw - 1)} ${r2(sy - 0.4 + droop * 0.4)} ${r2(tx + 9)} ${r2(t0)} ${r2(tx + 4.4)} ${r2(t0)} ` +
    `Q${r2(tx)} ${r2(t0 + 3)} ${r2(tx - 4.4)} ${r2(t0)} Z`
  out.push(`<path d="${torso}" fill="${top}"/>`)
  if (!mono) {
    out.push(
      poly(
        [
          [tx + sw, sy + 2.6 + droop],
          [tx + sw - 2.4, sy + 13],
          [tx + ww, 71 + dy],
          [tx + hemW, hemY],
          [tx + hemW - 3.8, hemY - 0.4],
          [tx + ww - 3.4, 71 + dy],
          [tx + sw - 5.4, sy + 13],
        ],
        topShade,
      ),
    )
    if (loose && !s.smooth)
      out.push(
        `<path d="M${r2(tx - 6)} ${r2(hipY - 8)} q3 2 5 0 M${r2(tx + 2)} ${r2(hipY - 4)} q3 2 5 0" stroke="${topShade}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`,
      )
    if (s.neckline === 'henley')
      out.push(
        `<path d="M${r2(tx)} ${r2(t0 + 2.5)} L${r2(tx)} ${r2(t0 + 10)}" stroke="${topShade}" stroke-width="0.9"/><circle cx="${r2(tx)}" cy="${r2(t0 + 5)}" r="0.6" fill="${c('white')}"/><circle cx="${r2(tx)}" cy="${r2(t0 + 8)}" r="0.6" fill="${c('white')}"/>`,
      )
    if (s.neckline === 'collar') {
      out.push(
        poly(
          [
            [tx - 4.6, t0 - 0.4],
            [tx - 0.3, t0 + 3.2],
            [tx - 3.2, t0 + 5.6],
          ],
          c('collar'),
        ),
      )
      out.push(
        poly(
          [
            [tx + 4.6, t0 - 0.4],
            [tx + 0.3, t0 + 3.2],
            [tx + 3.2, t0 + 5.6],
          ],
          c('collar'),
        ),
      )
      out.push(
        `<path d="M${r2(tx)} ${r2(t0 + 3.4)} L${r2(tx)} ${r2(hemY - 1)}" stroke="${topShade}" stroke-width="0.8"/>`,
      )
    }
  }

  // ---- jacket worn ----
  if (s.jacket === 'worn' && !seated) {
    out.push(
      poly(
        [
          [tx - 4.4, t0],
          [tx - sw, sy + 2.6],
          [tx - sw + 2.2, sy + 13],
          [tx - ww - 1.2, 71],
          [tx - hw - 1.4, hipY + 3],
          [tx - 3.6, hipY + 3],
          [tx - 3.4, t0 + 9],
        ],
        c(jk),
      ),
    )
    out.push(
      poly(
        [
          [tx + 4.4, t0],
          [tx + sw, sy + 2.6],
          [tx + sw - 2.2, sy + 13],
          [tx + ww + 1.2, 71],
          [tx + hw + 1.4, hipY + 3],
          [tx + 3.6, hipY + 3],
          [tx + 3.4, t0 + 9],
        ],
        c(shadeOf(jk)),
      ),
    )
  }
  // ---- jacket tied at the waist (front knot) ----
  if (s.jacket === 'waist' && !seated) {
    out.push(
      `<rect x="${r2(tx - hw - 1)}" y="${hipY - 3.4}" width="${r2(2 * hw + 2)}" height="4.2" rx="2" fill="${c(jk)}"/>`,
    )
    out.push(
      `<ellipse cx="${r2(tx)}" cy="${hipY + 0.6}" rx="2.6" ry="2.2" fill="${c(shadeOf(jk))}"/>`,
    )
    out.push(
      cap(tx - 1, hipY + 1.5, tx - 3, hipY + 9, 2.6, c(jk)) +
        cap(tx + 1, hipY + 1.5, tx + 2.6, hipY + 9.5, 2.6, c(jk)),
    )
  }

  // ---- crossbody bag ----
  if (s.crossbody && !seated) {
    const by = s.bagHigh ? hipY - 13 : hipY - 8
    out.push(
      `<path d="M${r2(tx + sw - 4)} ${r2(sy)} L${r2(tx - hw + 1)} ${r2(by + 2)}" stroke="${c('bag')}" stroke-width="1.3" fill="none"/>`,
    )
    out.push(
      `<rect x="${r2(tx - hw - 3)}" y="${r2(by)}" width="9" height="7" rx="2" fill="${c('bag')}"/>`,
    )
  }
  if (s.keys && !seated && s.jacket !== 'waist' && s.jacket !== 'worn') {
    out.push(
      `<circle cx="${r2(tx + hw - 2.4)}" cy="${r2(hipY + 1.6)}" r="1.4" fill="none" stroke="${c('metal')}" stroke-width="0.8"/><rect x="${r2(tx + hw - 3)}" y="${r2(hipY + 2.8)}" width="1.4" height="3.6" rx="0.5" fill="${c('metal')}"/>`,
    )
  }
  if (s.pen && s.jacket !== 'worn' && !mono) {
    out.push(
      `<rect x="${r2(tx - 9)}" y="${r2(sy + 7)}" width="5" height="5" rx="0.6" fill="${topShade}"/><rect x="${r2(tx - 7.6)}" y="${r2(sy + 4.6)}" width="1" height="4.4" rx="0.4" fill="${c('dark')}"/>`,
    )
  }
  // ---- neck accessories ----
  if (s.necklace && !mono)
    out.push(
      `<path d="M${r2(tx - 3.6)} ${r2(t0 + 0.6)} Q${r2(tx)} ${r2(t0 + 6.5)} ${r2(tx + 3.6)} ${r2(t0 + 0.6)}" stroke="${c('chain')}" stroke-width="0.6" fill="none"/>`,
    )
  if (s.headphones) {
    out.push(
      `<path d="M${r2(tx - 5.4)} ${r2(t0 - 1)} Q${r2(tx)} ${r2(t0 + 3.6)} ${r2(tx + 5.4)} ${r2(t0 - 1)}" stroke="${c('dark')}" stroke-width="1.2" fill="none"/>`,
    )
    out.push(
      `<ellipse cx="${r2(tx - 5.6)}" cy="${r2(t0 - 0.6)}" rx="1.8" ry="2.4" fill="${c('dark')}"/><ellipse cx="${r2(tx + 5.6)}" cy="${r2(t0 - 0.6)}" rx="1.8" ry="2.4" fill="${c('dark')}"/>`,
    )
  }

  // ---- arms ----
  const drawArm = (side: 'L' | 'R'): string => {
    const a = arm(side)
    const [sx, sy2] = side === 'L' ? shL : shR
    const tone = c(side === 'L' ? 'skin' : 'skinShade')
    const jacketArm = s.jacket === 'worn' && !seated
    const armTone = jacketArm ? c(side === 'L' ? jk : shadeOf(jk)) : tone
    const parts: string[] = []
    parts.push(cap(sx, sy2, a.e[0], a.e[1], aw + 0.5, armTone))
    parts.push(cap(a.e[0], a.e[1], a.w[0], a.w[1], aw, armTone))
    if (!jacketArm) {
      // sleeve: long (to wrist), pushed (just past the elbow) or short tee
      const sc = c(side === 'L' ? topKey : shadeOf(topKey))
      if (s.sleeves === 'long')
        parts.push(
          cap(sx, sy2 - 0.5, a.e[0], a.e[1], aw + 2, sc) +
            cap(a.e[0], a.e[1], a.w[0], a.w[1], aw + 1.6, sc),
        )
      else if (s.sleeves === 'pushed') {
        const px = a.e[0] + (a.w[0] - a.e[0]) * 0.22
        const py = a.e[1] + (a.w[1] - a.e[1]) * 0.22
        parts.push(
          cap(sx, sy2 - 0.5, a.e[0], a.e[1], aw + 2, sc) +
            cap(a.e[0], a.e[1], px, py, aw + 2.6, sc),
        )
      } else {
        const px = sx + (a.e[0] - sx) * 0.42
        const py = sy2 + (a.e[1] - sy2) * 0.42
        parts.push(cap(sx, sy2 - 0.5, px, py, aw + 2.6, sc))
      }
    }
    if (a.hand)
      parts.push(
        `<ellipse cx="${r2(a.w[0])}" cy="${r2(a.w[1] + (a.cross || a.hips ? 0 : 3))}" rx="${a.cross ? 2.8 : 2.4}" ry="${a.cross ? 2.4 : 3.3}" fill="${tone}"/>`,
      )
    // wrist kit (only when the wrist is visible)
    const wristVisible = a.hand && s.sleeves !== 'long' && !jacketArm
    if (wristVisible && side === 'L' && s.watch) {
      parts.push(
        `<rect x="${r2(a.w[0] - 2.4)}" y="${r2(a.w[1] - 2.2)}" width="4.8" height="2.4" rx="0.8" fill="${c(s.watch === 'metal' ? 'metal' : 'dark')}"/>`,
      )
      parts.push(
        `<circle cx="${r2(a.w[0])}" cy="${r2(a.w[1] - 1)}" r="1.3" fill="${c(s.watch === 'metal' ? 'dark' : 'white')}"/>`,
      )
    }
    if (wristVisible && side === 'R' && s.wristband)
      parts.push(
        `<rect x="${r2(a.w[0] - 2.4)}" y="${r2(a.w[1] - 2)}" width="4.8" height="1.8" rx="0.8" fill="${c(s.wristband === 'leather' ? 'beltLeather' : 'accent')}"/>`,
      )
    if (a.holds === 'bottle')
      parts.push(
        `<rect x="${r2(a.w[0] - 2.5)}" y="${r2(a.w[1] + 0.5)}" width="5" height="14" rx="1.6" fill="${c('bottle')}"/><rect x="${r2(a.w[0] - 1.9)}" y="${r2(a.w[1] - 2)}" width="3.8" height="3" rx="0.8" fill="${c('bottleCap')}"/>` +
          `<ellipse cx="${r2(a.w[0])}" cy="${r2(a.w[1] + 3)}" rx="2.6" ry="2.6" fill="${tone}"/>`,
      )
    return parts.join('')
  }
  out.push(drawArm('L'), drawArm('R'))
  if (s.backpack && !seated)
    out.push(
      `<path d="M${r2(tx - sw + 3.6)} ${r2(sy - 0.6)} L${r2(tx - sw + 4.6)} ${r2(sy + 16)}" stroke="${c('pack')}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
    )

  // ---- head: always level, no face at all (smooth shape + hair) ----
  out.push(
    `<ellipse cx="${r2(tx)}" cy="${r2(hcy)}" rx="6.8" ry="8.8" fill="${c('skin')}"/>`,
  )
  out.push(
    drawHair(
      mono && s.hair === 'messy' ? 'combed' : s.hair,
      tx,
      hcy,
      c('hair'),
    ),
  )
  return out.join('')
}

export const ghostFilter = (id: string): string =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">` +
  `<feMorphology in="SourceAlpha" operator="dilate" radius="0.75" result="d"/>` +
  `<feComposite in="d" in2="SourceAlpha" operator="out" result="o"/>` +
  `<feFlood flood-color="${T.ghost}" result="f"/>` +
  `<feComposite in="f" in2="o" operator="in"/></filter>`
