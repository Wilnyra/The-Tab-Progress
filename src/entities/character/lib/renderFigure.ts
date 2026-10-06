// The Figure, rigged and animated (bones in local space, children nested at
// the parent's end).
//
// Rig rules
// - Every bone is <g class="bone b-NAME"> drawn in its own local space:
//   proximal joint at (0,0), bone runs along +Y to (0,L).
// - A child bone sits inside the parent bone, wrapped in
//   <g class="attach" transform="translate(ax ay)">: (0,L) for limbs, a
//   constant offset only for hips, shoulders and neck. Nothing else
//   positions a child.
// - Bones animate ONLY rotate() around their own origin
//   (transform-origin: 0 0). Never translate/scale on bones.
// - The whole figure can step sideways through a non-bone wrapper
//   (.mover), which moves every bone together.
import type {
  ActivityId,
  ActivityKey,
  ArmAngles,
  FigureSkeleton,
  FigureState,
  IdleAngles,
  RenderFigureOptions,
  Side,
  StaticFigureOptions,
} from '../model/types'
import { ACTIVITIES, isActivityId, pickActivity } from './activities'
import { getChange } from './changes'
import { clampDay, hashStr, poly, r2 } from './math'
import { drawRoom, R } from './room'
import { HIP_Y, INNER_VIEWBOX, poseAngles, RX, skeleton } from './skeleton'
import {
  drawFigure,
  drawHair,
  drawShoe,
  getState,
  ghostFilter,
  pantsKeyOf,
  shadeOf,
  T,
  TOP_KEYS,
} from './wardrobe'
import type { ColorFn, JacketKey } from './wardrobe'

// fills ~95% of the 160 height
const FRAME = 'translate(60 156) scale(1.06) translate(-60 -150)'

// ---------- drawing primitives ----------
const bone = (name: string, angle: number, inner: string): string =>
  `<g class="bone b-${name}" style="transform-origin:0 0;transform:rotate(${r2(angle)}deg)">${inner}</g>`
const attach = (ax: number, ay: number, inner: string): string =>
  `<g class="attach" data-attach="${r2(ax)} ${r2(ay)}" transform="translate(${r2(ax)} ${r2(ay)})">${inner}</g>`
// A capsule along the bone axis, with joint discs at both ends (covers
// any sub-pixel seam).
const capsule = (len: number, w: number, fill: string): string =>
  `<line x1="0" y1="0" x2="0" y2="${r2(len)}" stroke="${fill}" stroke-width="${r2(w)}" stroke-linecap="round"/>` +
  `<circle cx="0" cy="0" r="${r2(w / 2)}" fill="${fill}"/><circle cx="0" cy="${r2(len)}" r="${r2(w / 2)}" fill="${fill}"/>`
const segment = (from: number, to: number, w: number, fill: string): string =>
  `<line x1="0" y1="${r2(from)}" x2="0" y2="${r2(to)}" stroke="${fill}" stroke-width="${r2(w)}" stroke-linecap="round"/>`
// world-space content inside a bone whose rest joint is at (jx, jy) and
// rest angle 0
const world = (jx: number, jy: number, inner: string): string =>
  `<g transform="translate(${r2(-jx)} ${r2(-jy)})">${inner}</g>`

// ---------- the rigged figure ----------
const drawRig = (
  s: FigureState,
  sk: FigureSkeleton,
  idle: IdleAngles,
): string => {
  const c: ColorFn = (key) => T[key]
  const topKey = TOP_KEYS[s.top]
  const top = c(topKey)
  const topShade = c(shadeOf(topKey))
  const jk: JacketKey = s.jacketTone ? 'jacket1' : 'jacket0'
  const pantsKey = pantsKeyOf(s)
  const { sy, droop, sw, ww, hw, nw, aw, hcy } = sk
  const tx = RX
  const hipY = HIP_Y
  const jacketWorn = s.jacket === 'worn'

  // legs: thigh -> shin -> foot (foot counter-rotates to keep shoe flat)
  const leg = (side: Side): string => {
    const sg = side === 'L' ? -1 : 1
    const s1 = side === 'L' ? 'l' : 'r'
    const pk = c(sg < 0 ? pantsKey : shadeOf(pantsKey))
    const ank =
      s.trousers === 'joggers'
        ? 2.6
        : s.trousers === 'tapered' || s.trousers === 'pressed'
          ? 2.7
          : 3.2
    const hemL = (s.cuffs ? 141 : 146) - 113
    const th = side === 'L' ? idle.thL : idle.thR
    const sh = side === 'L' ? idle.shL : idle.shR
    const foot = world(0, 146, drawShoe(s, c, 0, sg))
    let shin =
      poly(
        [
          [sg * 4.4, 0],
          [-sg * 3.4, 0],
          [-sg * ank, hemL],
          [sg * (ank + 0.4), hemL],
        ],
        pk,
      ) + `<circle cx="${sg * 0.5}" cy="0" r="3.9" fill="${pk}"/>`
    if (s.trousers === 'joggers')
      shin += `<rect x="-3.2" y="29" width="6.4" height="3.6" rx="1.2" fill="${c(shadeOf(pantsKey))}"/>`
    if (s.cuffs)
      shin += `<rect x="${r2(-ank - 0.6)}" y="26.6" width="${r2(2 * ank + 1.2)}" height="2.4" rx="0.6" fill="${c(shadeOf(pantsKey))}"/><rect x="-2.2" y="29" width="4.4" height="4" fill="${c(s.socks ? 'sock' : 'skinShade')}"/>`
    if (s.trousers === 'pressed')
      shin += `<path d="M0 0 L0 ${hemL - 2}" stroke="${c('crease')}" stroke-width="0.6"/>`
    shin += attach(0, sk.shin, bone(`foot-${s1}`, -(th + sh), foot))
    const thigh =
      poly(
        [
          [sg * 5.6, -2],
          [-sg * 5.3, -2],
          [-sg * 5.3, 5],
          [-sg * 3.4, sk.thigh],
          [sg * 4.4, sk.thigh],
        ],
        pk,
      ) + attach(0, sk.thigh, bone(`shin-${s1}`, sh, shin))
    return attach(sg * sk.hip, sk.hipDy, bone(`thigh-${s1}`, th, thigh))
  }

  // arms: upper arm -> forearm -> hand
  const arm = (side: Side): string => {
    const s1 = side === 'L' ? 'l' : 'r'
    const skin = c(side === 'L' ? 'skin' : 'skinShade')
    const tone = jacketWorn ? c(side === 'L' ? jk : shadeOf(jk)) : skin
    const sc = c(side === 'L' ? topKey : shadeOf(topKey))
    const Lu = sk.upper
    const Lf = sk.fore
    let upper = capsule(Lu, aw + 0.5, tone)
    let fore = capsule(Lf, aw, tone)
    if (!jacketWorn) {
      if (s.sleeves === 'long') {
        upper += capsule(Lu, aw + 2, sc)
        fore += capsule(Lf, aw + 1.6, sc)
      } else if (s.sleeves === 'pushed') {
        upper += capsule(Lu, aw + 2, sc)
        fore += segment(0, Lf * 0.22, aw + 2.6, sc)
      } else upper += segment(-0.5, Lu * 0.42, aw + 2.6, sc)
    }
    const wristKit = !jacketWorn && s.sleeves !== 'long'
    if (wristKit && side === 'L' && s.watch)
      fore += `<rect x="-2.4" y="${r2(Lf - 2.2)}" width="4.8" height="2.4" rx="0.8" fill="${c(s.watch === 'metal' ? 'metal' : 'dark')}"/><circle cx="0" cy="${r2(Lf - 1)}" r="1.3" fill="${c(s.watch === 'metal' ? 'dark' : 'white')}"/>`
    if (wristKit && side === 'R' && s.wristband)
      fore += `<rect x="-2.4" y="${r2(Lf - 2)}" width="4.8" height="1.8" rx="0.8" fill="${c(s.wristband === 'leather' ? 'beltLeather' : 'accent')}"/>`
    let hand = `<ellipse cx="0" cy="3" rx="2.4" ry="3.3" fill="${skin}"/>`
    if (side === 'R' && s.bottle)
      hand =
        `<g class="x-bottle-hand" opacity="${idle.bottleInHand}"><rect x="-2.5" y="0.5" width="5" height="14" rx="1.6" fill="${c('bottle')}"/><rect x="-1.9" y="-2" width="3.8" height="3" rx="0.8" fill="${c('bottleCap')}"/></g>` +
        hand
    if (side === 'L')
      hand += `<g class="x-book" opacity="0"><rect x="-1" y="1" width="7" height="9" rx="0.6" fill="${R.book2}"/><rect x="2.4" y="1" width="0.6" height="9" fill="${R.woodShade}"/></g>`
    const handOn = side === 'L' ? idle.handL : idle.handR
    const handBone = bone(
      `hand-${s1}`,
      0,
      `<g class="x-hand-${s1}" opacity="${handOn}">${hand}</g>`,
    )
    const foreAngle = side === 'L' ? idle.fL : idle.fR
    const upperAngle = side === 'L' ? idle.uL : idle.uR
    const foreBone = bone(
      `forearm-${s1}`,
      foreAngle,
      fore + attach(0, Lf, handBone),
    )
    const upperBone = bone(
      `upperarm-${s1}`,
      upperAngle,
      upper + attach(0, Lu, foreBone),
    )
    const [ax, ay] = side === 'L' ? sk.shoulderL : sk.shoulderR
    return attach(ax, ay, upperBone)
  }

  // torso (world content, rest joint = hip centre)
  const t0 = sy - 1.2
  const hemY =
    s.tuck === 'none' ? hipY + 6 : s.tuck === 'front' ? hipY + 3.5 : hipY - 2.2
  const hemW = s.tuck === 'none' ? hw + 2.6 : s.tuck === 'front' ? hw + 1.6 : hw
  const hemMid = s.tuck === 'front' ? hipY - 3.2 : hemY
  const torsoPath =
    `M${r2(tx - 4.4)} ${r2(t0)} C${r2(tx - 9)} ${r2(t0)} ${r2(tx - sw + 1)} ${r2(sy - 0.4 + droop * 0.4)} ${r2(tx - sw)} ${r2(sy + 2.6 + droop)} ` +
    `L${r2(tx - sw + 2.4)} ${r2(sy + 13)} Q${r2(tx - ww - 0.6)} 64 ${r2(tx - ww)} 71 L${r2(tx - hemW)} ${r2(hemY)} ` +
    `Q${tx} ${r2(hemMid)} ${r2(tx + hemW)} ${r2(hemY)} L${r2(tx + ww)} 71 Q${r2(tx + ww + 0.6)} 64 ${r2(tx + sw - 2.4)} ${r2(sy + 13)} ` +
    `L${r2(tx + sw)} ${r2(sy + 2.6 + droop)} C${r2(tx + sw - 1)} ${r2(sy - 0.4 + droop * 0.4)} ${r2(tx + 9)} ${r2(t0)} ${r2(tx + 4.4)} ${r2(t0)} ` +
    `Q${tx} ${r2(t0 + 3)} ${r2(tx - 4.4)} ${r2(t0)} Z`
  const back: string[] = []
  if (s.backpack)
    back.push(
      `<rect x="${r2(tx - sw - 4.5)}" y="${r2(sy + 3)}" width="9" height="22" rx="3.5" fill="${c('pack')}"/>`,
    )
  if (s.jacket === 'shoulder')
    back.push(
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
  back.push(
    `<rect x="${r2(tx - nw / 2)}" y="${hcy + 5}" width="${r2(nw)}" height="${r2(sy - hcy - 3)}" fill="${c('skinShade')}"/>`,
  )
  back.push(`<path d="${torsoPath}" fill="${top}"/>`)
  back.push(
    poly(
      [
        [tx + sw, sy + 2.6 + droop],
        [tx + sw - 2.4, sy + 13],
        [tx + ww, 71],
        [tx + hemW, hemY],
        [tx + hemW - 3.8, hemY - 0.4],
        [tx + ww - 3.4, 71],
        [tx + sw - 5.4, sy + 13],
      ],
      topShade,
    ),
  )
  if (!s.fitted && !s.smooth)
    back.push(
      `<path d="M${r2(tx - 6)} ${hipY - 8} q3 2 5 0 M${r2(tx + 2)} ${hipY - 4} q3 2 5 0" stroke="${topShade}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`,
    )
  if (s.neckline === 'henley')
    back.push(
      `<path d="M${tx} ${r2(t0 + 2.5)} L${tx} ${r2(t0 + 10)}" stroke="${topShade}" stroke-width="0.9"/><circle cx="${tx}" cy="${r2(t0 + 5)}" r="0.6" fill="${c('white')}"/><circle cx="${tx}" cy="${r2(t0 + 8)}" r="0.6" fill="${c('white')}"/>`,
    )
  if (s.neckline === 'collar')
    back.push(
      poly(
        [
          [tx - 4.6, t0 - 0.4],
          [tx - 0.3, t0 + 3.2],
          [tx - 3.2, t0 + 5.6],
        ],
        c('collar'),
      ) +
        poly(
          [
            [tx + 4.6, t0 - 0.4],
            [tx + 0.3, t0 + 3.2],
            [tx + 3.2, t0 + 5.6],
          ],
          c('collar'),
        ) +
        `<path d="M${tx} ${r2(t0 + 3.4)} L${tx} ${r2(hemY - 1)}" stroke="${topShade}" stroke-width="0.8"/>`,
    )
  if (jacketWorn) {
    back.push(
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
    back.push(
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
  if (s.pen && !jacketWorn)
    back.push(
      `<rect x="${r2(tx - 9)}" y="${r2(sy + 7)}" width="5" height="5" rx="0.6" fill="${topShade}"/><rect x="${r2(tx - 7.6)}" y="${r2(sy + 4.6)}" width="1" height="4.4" rx="0.4" fill="${c('dark')}"/>`,
    )
  if (s.crossbody) {
    const by = s.bagHigh ? hipY - 13 : hipY - 8
    back.push(
      `<path d="M${r2(tx + sw - 4)} ${r2(sy)} L${r2(tx - hw + 1)} ${r2(by + 2)}" stroke="${c('bag')}" stroke-width="1.3" fill="none"/><rect x="${r2(tx - hw - 3)}" y="${r2(by)}" width="9" height="7" rx="2" fill="${c('bag')}"/>`,
    )
  }
  if (s.necklace)
    back.push(
      `<path d="M${r2(tx - 3.6)} ${r2(t0 + 0.6)} Q${tx} ${r2(t0 + 6.5)} ${r2(tx + 3.6)} ${r2(t0 + 0.6)}" stroke="${c('chain')}" stroke-width="0.6" fill="none"/>`,
    )
  if (s.headphones)
    back.push(
      `<path d="M${r2(tx - 5.4)} ${r2(t0 - 1)} Q${tx} ${r2(t0 + 3.6)} ${r2(tx + 5.4)} ${r2(t0 - 1)}" stroke="${c('dark')}" stroke-width="1.2" fill="none"/><ellipse cx="${r2(tx - 5.6)}" cy="${r2(t0 - 0.6)}" rx="1.8" ry="2.4" fill="${c('dark')}"/><ellipse cx="${r2(tx + 5.6)}" cy="${r2(t0 - 0.6)}" rx="1.8" ry="2.4" fill="${c('dark')}"/>`,
    )
  const strapFront = s.backpack
    ? `<path d="M${r2(tx - sw + 3.6)} ${r2(sy - 0.6)} L${r2(tx - sw + 4.6)} ${r2(sy + 16)}" stroke="${c('pack')}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`
    : ''
  // head bone: joint at the neck, content in world space around (60, 30)
  const headBone = bone(
    'head',
    0,
    world(
      RX,
      30,
      `<ellipse cx="${tx}" cy="${hcy}" rx="6.8" ry="8.8" fill="${c('skin')}"/>` +
        drawHair(s.hair, tx, hcy, c('hair')),
    ),
  )
  const torsoBone = bone(
    'torso',
    0,
    world(RX, hipY, back.join('')) +
      arm('L') +
      arm('R') +
      world(RX, hipY, strapFront) +
      attach(sk.neck[0], sk.neck[1], headBone),
  )

  // pelvis (root): seat block behind the thighs, thighs, belt, torso,
  // waist jacket front, keys
  const seat = `<rect x="${r2(tx - hw)}" y="${hipY - 2}" width="${r2(2 * hw)}" height="10" rx="2" fill="${c(pantsKey)}"/>`
  const pelvisBack =
    (s.jacket === 'waist'
      ? poly(
          [
            [tx - hw - 1.5, hipY - 3],
            [tx + hw + 1.5, hipY - 3],
            [tx + hw + 3, hipY + 14],
            [tx - hw - 3, hipY + 14],
          ],
          c(shadeOf(jk)),
        )
      : '') + seat
  const belt =
    s.belt && s.tuck !== 'none'
      ? `<rect x="${r2(tx - hw - 0.2)}" y="${hipY - 2.2}" width="${r2(2 * hw + 0.4)}" height="3" fill="${c(s.belt === 'leather' ? 'beltLeather' : 'belt')}"/><rect x="${r2(tx - 1.6)}" y="${hipY - 2.4}" width="3.2" height="3.4" rx="0.4" fill="none" stroke="${c('metal')}" stroke-width="0.7"/>`
      : ''
  let front = ''
  if (s.jacket === 'waist')
    front += `<rect x="${r2(tx - hw - 1)}" y="${hipY - 3.4}" width="${r2(2 * hw + 2)}" height="4.2" rx="2" fill="${c(jk)}"/><ellipse cx="${tx}" cy="${hipY + 0.6}" rx="2.6" ry="2.2" fill="${c(shadeOf(jk))}"/><path d="M${tx - 1} ${hipY + 1.5} L${tx - 3} ${hipY + 9} M${tx + 1} ${hipY + 1.5} L${tx + 2.6} ${hipY + 9.5}" stroke="${c(jk)}" stroke-width="2.6" stroke-linecap="round"/>`
  if (s.keys && s.jacket !== 'waist' && !jacketWorn)
    front += `<circle cx="${r2(tx + hw - 2.4)}" cy="${hipY + 1.6}" r="1.4" fill="none" stroke="${c('metal')}" stroke-width="0.8"/><rect x="${r2(tx + hw - 3)}" y="${hipY + 2.8}" width="1.4" height="3.6" rx="0.5" fill="${c('metal')}"/>`
  const pelvisBone = bone(
    'pelvis',
    0,
    world(RX, hipY, pelvisBack) +
      leg('L') +
      leg('R') +
      world(RX, hipY, belt) +
      attach(0, 0, torsoBone) +
      world(RX, hipY, front),
  )

  const floor: string[] = []
  if (s.bottle)
    floor.push(
      `<g class="x-bottle-floor" opacity="${idle.bottleInHand ? 0 : 1}"><rect x="${RX + 19}" y="136" width="5" height="14" rx="1.6" fill="${c('bottle')}"/><rect x="${RX + 19.6}" y="133.6" width="3.8" height="3" rx="0.8" fill="${c('bottleCap')}"/></g>`,
    )
  if (s.notebook)
    floor.push(
      `<rect x="${RX + 26}" y="146.2" width="10" height="3.8" rx="0.6" fill="${c('notebook')}"/><rect x="${RX + 26}" y="148.6" width="10" height="1.4" fill="${c('notebookEdge')}"/>`,
    )
  return (
    floor.join('') +
    `<g class="mover"><g transform="translate(${RX} ${hipY})">${pelvisBone}</g></g>`
  )
}

// ---------- clip CSS: rotations on bones only (plus the .mover step) ----
type ArmKey = keyof ArmAngles
type LegKey = 'thL' | 'shL' | 'thR' | 'shR'
type BoneKey = ArmKey | LegKey | 'torso'

const BONES: ReadonlyArray<readonly [BoneKey, string]> = [
  ['uL', 'b-upperarm-l'],
  ['fL', 'b-forearm-l'],
  ['uR', 'b-upperarm-r'],
  ['fR', 'b-forearm-r'],
  ['thL', 'b-thigh-l'],
  ['shL', 'b-shin-l'],
  ['thR', 'b-thigh-r'],
  ['shR', 'b-shin-r'],
  ['torso', 'b-torso'],
]

const isLegKey = (key: BoneKey): key is LegKey =>
  key === 'thL' || key === 'shL' || key === 'thR' || key === 'shR'

const buildCss = (
  scope: string,
  act: ActivityId,
  idle: IdleAngles,
  rest: ArmAngles,
): string => {
  const A = ACTIVITIES[act]
  const frames: ActivityKey[] = [{ t: 0 }, ...A.keys, { t: 100 }]
  const isEdge = (f: ActivityKey): boolean => f.t === 0 || f.t === 100
  // arm keys are relative to the relaxed arm; leg keys are deltas on the
  // idle stance
  const angle = (f: ActivityKey, key: BoneKey): number => {
    const value = f[key]
    if (isEdge(f) || value == null) return key === 'torso' ? 0 : idle[key]
    if (key === 'torso') return value
    if (isLegKey(key)) return idle[key] + value
    return rest[key] + value
  }
  const css: string[] = []
  const anim = (cls: string, name: string, steps: string[]): void => {
    css.push(`@keyframes ${scope}-${name}{${steps.join('')}}`)
    css.push(
      `.${scope} .${cls}{animation:${scope}-${name} ${A.dur}s ease-in-out both}`,
    )
  }
  for (const [key, cls] of BONES) {
    if (!frames.some((f) => f[key] != null)) continue
    anim(
      cls,
      key,
      frames.map((f) => `${f.t}%{transform:rotate(${r2(angle(f, key))}deg)}`),
    )
  }
  // feet stay flat: foot = -(thigh + shin)
  const legs: ReadonlyArray<readonly [Side, LegKey, LegKey]> = [
    ['L', 'thL', 'shL'],
    ['R', 'thR', 'shR'],
  ]
  for (const [side, th, sh] of legs) {
    if (!frames.some((f) => f[th] != null || f[sh] != null)) continue
    const lower = side === 'L' ? 'l' : 'r'
    anim(
      `b-foot-${lower}`,
      `ft${side}`,
      frames.map(
        (f) =>
          `${f.t}%{transform:rotate(${r2(-(angle(f, th) + angle(f, sh)))}deg)}`,
      ),
    )
  }
  if (frames.some((f) => f.dx != null))
    anim(
      'mover',
      'mv',
      frames.map(
        (f) =>
          `${f.t}%{transform:translate(${isEdge(f) ? 0 : (f.dx ?? 0)}px,0)}`,
      ),
    )
  const hands: ReadonlyArray<readonly [Side, 0 | 1]> = [
    ['L', idle.handL],
    ['R', idle.handR],
  ]
  for (const [side, on] of hands) {
    if (on === 1) continue
    const lower = side === 'L' ? 'l' : 'r'
    anim(
      `x-hand-${lower}`,
      `h${side}`,
      frames.map((f) => `${f.t}%{opacity:${isEdge(f) ? 0 : f.hand ? 1 : 0}}`),
    )
  }
  if (act === 'drink' && !idle.bottleInHand) {
    anim(
      'x-bottle-hand',
      'bh',
      frames.map((f) => `${f.t}%{opacity:${f.bottle ? 1 : 0}}`),
    )
    anim(
      'x-bottle-floor',
      'bf',
      frames.map((f) => `${f.t}%{opacity:${f.bottle ? 0 : 1}}`),
    )
  }
  if (act === 'book')
    anim(
      'x-book',
      'bk',
      frames.map((f) => `${f.t}%{opacity:${f.book ? 1 : 0}}`),
    )
  if (act === 'lamp')
    css.push(
      `@keyframes ${scope}-glow{0%,55%{opacity:0}100%{opacity:.45}}.${scope} .x-glow{animation:${scope}-glow ${A.dur}s ease-in-out both}`,
    )
  css.push(
    `@media (prefers-reduced-motion: reduce){.${scope} *{animation:none!important}}`,
  )
  return css.join('')
}

/** Static figure (no rig): the seated rest after a break. */
export const renderStaticFigure = (
  streakDays: number,
  opts: StaticFigureOptions = {},
): string => {
  const s = getState(streakDays, opts)
  const parts: string[] = []
  const roomSvg = drawRoom(s.best)
  // future self: the day-365 you, half a step aside, converging as the
  // streak grows
  let future = ''
  let futureRoom = ''
  if (opts.futureSelf && !s.resting) {
    const dx = r2(12 * (1 - Math.sqrt(Math.min(s.n, 365) / 365)))
    future = `<g opacity="0.16" transform="translate(${dx} 0)">${drawFigure(getState(365), T.ghost)}</g>`
    if (s.best < 365)
      futureRoom = `<g opacity="0.1">${drawRoom(365, true).replace(/fill="hsl\(var\(--room-[^)]*\)\)"/g, `fill="${T.ghost}"`)}</g>`
  }
  if (s.resting)
    parts.push(
      `<rect x="20" y="122" width="80" height="28" rx="2" fill="none" stroke="${T.floor}" stroke-width="1.4"/>`,
    )
  if (future) parts.push(future)
  parts.push(drawFigure(s, null))
  const gd =
    opts.ghostDay != null
      ? clampDay(opts.ghostDay)
      : opts.ghostDaysAgo != null
        ? Math.max(0, s.n - clampDay(opts.ghostDaysAgo))
        : null
  let defs = ''
  if (gd != null && !s.resting) {
    const id = `fg2-ghost-${s.n}-${gd}`
    defs = `<defs>${ghostFilter(id)}</defs>`
    parts.push(
      `<g filter="url(#${id})">${drawFigure(getState(gd), '#000')}</g>`,
    )
  }
  const label = s.resting
    ? `Resting after a ${s.best}-day streak, everything earned is kept`
    : `Day ${s.n}: ${getChange(s.n).text}${gd != null ? `. Outline shows day ${gd}` : ''}`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="120" height="160" role="img" aria-label="${label.replace(/"/g, '')}">${defs}` +
    futureRoom +
    roomSvg +
    `<line x1="6" y1="156" x2="114" y2="156" stroke="${T.floor}" stroke-width="1.4" stroke-linecap="round"/>` +
    `<g transform="${FRAME}">${parts.join('')}</g></svg>`
  )
}

/** Renders the figure as an SVG string (viewBox 0 0 120 160). Pure and
 * deterministic for the same inputs. */
export const renderFigure = (
  streakDays: number,
  opts: RenderFigureOptions = {},
): string => {
  const s = getState(streakDays, opts)
  // seated rest: static, no clip
  if (s.resting) return renderStaticFigure(streakDays, opts)
  const sk = skeleton(s)
  const { idle, rest } = poseAngles(s, sk)
  const animate = opts.animate !== false
  const act: ActivityId | null = animate
    ? isActivityId(opts.activity)
      ? opts.activity
      : pickActivity(s.n, opts.seed ?? 'default', opts)
    : null
  const instance = (opts.instance ?? '').replace(/[^A-Za-z0-9_-]/g, '')
  const scope = `fa${hashStr(`${opts.seed ?? ''}|${s.n}|${s.best}|${act}`).toString(36)}${instance}`
  const parts: string[] = []
  let futureRoom = ''
  if (opts.futureSelf) {
    const dx = r2(12 * (1 - Math.sqrt(Math.min(s.n, 365) / 365)))
    parts.push(
      `<g opacity="0.16" transform="translate(${dx} 0)">${drawFigure(getState(365), T.ghost)}</g>`,
    )
    if (s.best < 365)
      futureRoom = `<g opacity="0.1">${drawRoom(365, true).replace(/fill="hsl\(var\(--room-[^)]*\)\)"/g, `fill="${T.ghost}"`)}</g>`
  }
  parts.push(drawRig(s, sk, idle))
  let defs = ''
  const gd = opts.ghostDay != null ? clampDay(opts.ghostDay) : null
  if (gd != null) {
    defs = `<defs>${ghostFilter(`${scope}-gh`)}</defs>`
    parts.push(
      `<g filter="url(#${scope}-gh)">${drawFigure(getState(gd), '#000')}</g>`,
    )
  }
  const lampX = s.best >= 30 ? 33 : 24
  const glow =
    act === 'lamp' && s.best < 270
      ? `<circle class="x-glow" cx="${r2(60 + 1.06 * (lampX - 60))}" cy="${r2(156 + 1.06 * (70 - 150))}" r="13" fill="${R.glow}" opacity="0"/>`
      : ''
  const style = act ? `<style>${buildCss(scope, act, idle, rest)}</style>` : ''
  const label = `Day ${s.n}${act ? `, today: ${ACTIVITIES[act].label.toLowerCase()}` : ''}`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${scope}" viewBox="0 0 120 160" width="120" height="160" role="img" aria-label="${label}"${act ? ` data-activity="${act}" data-dur="${ACTIVITIES[act].dur}"` : ''}>${style}${defs}` +
    futureRoom +
    drawRoom(s.best) +
    glow +
    `<line x1="6" y1="156" x2="114" y2="156" stroke="${T.floor}" stroke-width="1.4" stroke-linecap="round"/>` +
    `<svg x="0" y="0" width="120" height="160" viewBox="${INNER_VIEWBOX}" overflow="visible">${parts.join('')}</svg></svg>`
  )
}
