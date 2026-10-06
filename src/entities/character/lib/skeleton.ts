// Rig skeleton: bone lengths and joint offsets from the v3 body, plus the
// static poses expressed as joint angles. Bone lengths stay fixed.
import type {
  ArmAngles,
  FigureSkeleton,
  FigureState,
  IdleAngles,
  Point,
  Side,
} from '../model/types'
import { r2 } from './math'

export const RX = 60
export const HIP_Y = 82
// = v3 translate(60 156) scale(1.06) translate(-60 -150)
export const INNER_VIEWBOX = '3.396 2.83 113.208 150.943'

// angle (deg, clockwise) that turns the bone axis (0,1) into (dx,dy)
const boneAngle = (dx: number, dy: number): number =>
  (Math.atan2(-dx, dy) * 180) / Math.PI
const wrap = (a: number): number => ((a + 540) % 360) - 180

const sideSign = (side: Side): number => (side === 'L' ? -1 : 1)

export const skeleton = (s: FigureState): FigureSkeleton => {
  const u = 1 - s.posture
  const b = s.body
  const sy = 38 + 0.8 * u
  const droop = 2 * u
  const sw = 13.2 + 2.2 * b - 1.0 * u
  const joints = (
    side: Side,
  ): {
    S: Point
    shoulder: Point
    upper: number
    fore: number
  } => {
    const sg = sideSign(side)
    const S: Point = [RX + sg * (sw - 2.2), sy + 3.4 + droop]
    const E: Point = [RX + sg * (sw + 0.9), 63]
    const W: Point = [RX + sg * (sw + 0.4), 86]
    return {
      S,
      shoulder: [S[0] - RX, S[1] - HIP_Y],
      upper: Math.hypot(E[0] - S[0], E[1] - S[1]),
      fore: Math.hypot(W[0] - E[0], W[1] - E[1]),
    }
  }
  const L = joints('L')
  const Rt = joints('R')
  return {
    u,
    b,
    sy,
    droop,
    sw,
    ww: 10.6 - 1.1 * b + (s.fitted ? 0 : 1.4),
    hw: 11.2,
    nw: 5.4 + 0.9 * b,
    aw: 4.1 + 0.8 * b,
    hcy: 21,
    neck: [0, 30 - HIP_Y], // head joint in torso space
    hip: 5.6, // hip joints at (±5.6, 2) in pelvis space
    hipDy: 2,
    thigh: 29,
    shin: 33,
    foot: 4,
    // both sides are mirror images; the prototype kept the R values
    upper: Rt.upper,
    fore: Rt.fore,
    shoulderL: L.shoulder,
    shoulderR: Rt.shoulder,
    SL: L.S,
    SR: Rt.S,
  }
}

type ArmTarget = { e: Point; w: Point; hand: 0 | 1 }

// v3 static poses -> joint angles (arm targets from v3)
export const poseAngles = (
  s: FigureState,
  sk: FigureSkeleton,
): { idle: IdleAngles; rest: ArmAngles } => {
  const { sw, hw, ww, sy } = sk
  const relaxed = (sg: number): ArmTarget => ({
    e: [RX + sg * (sw + 0.9), 63],
    w: [RX + sg * (sw + 0.4), 86],
    hand: 1,
  })
  const pocket = (sg: number): ArmTarget => ({
    e: [RX + sg * (sw + 0.6), 63],
    w: [RX + sg * (hw - 2.6), 83],
    hand: 0,
  })
  const target = (side: Side): ArmTarget => {
    const sg = sideSign(side)
    switch (s.pose) {
      case 'pockets':
        return pocket(sg)
      case 'bottle':
        return side === 'R'
          ? { e: [RX + sw + 1.4, 63], w: [RX + sw + 3.4, 81], hand: 1 }
          : relaxed(sg)
      case 'crossed':
        return side === 'L'
          ? { e: [RX - sw - 1.6, 60], w: [RX + 7.5, 58.5], hand: 1 }
          : { e: [RX + sw + 1.6, 61], w: [RX - 7.5, 60.5], hand: 1 }
      case 'pocketOne':
        return side === 'R' ? pocket(sg) : relaxed(sg)
      case 'hips':
        return {
          e: [RX + sg * (sw + 6.5), 60],
          w: [RX + sg * (ww + 1.2), 72],
          hand: 1,
        }
      case 'overShoulder':
        return side === 'R'
          ? { e: [RX + sw + 4.5, 55], w: [RX + sw - 1.5, sy - 1], hand: 1 }
          : relaxed(sg)
      case 'open':
        return {
          e: [RX + sg * (sw + 1.8), 63],
          w: [RX + sg * (sw + 2.6), 85],
          hand: 1,
        }
      default:
        return relaxed(sg)
    }
  }
  const angles = (side: Side, t: ArmTarget): [number, number] => {
    const S = side === 'L' ? sk.SL : sk.SR
    const u = boneAngle(t.e[0] - S[0], t.e[1] - S[1])
    const f = wrap(boneAngle(t.w[0] - t.e[0], t.w[1] - t.e[1]) - u)
    return [r2(u), r2(f)]
  }
  const tL = target('L')
  const tR = target('R')
  const [uL, fL] = angles('L', tL)
  const [uR, fR] = angles('R', tR)
  const [ruL, rfL] = angles('L', relaxed(-1))
  const [ruR, rfR] = angles('R', relaxed(1))
  const legs = s.evenWeight
    ? { thL: 2.2, shL: -1.2, thR: -2.2, shR: 1.2 }
    : { thL: 1.2, shL: -1.2, thR: -4.5, shR: 6 }
  return {
    idle: {
      uL,
      fL,
      uR,
      fR,
      handL: tL.hand,
      handR: tR.hand,
      ...legs,
      bottleInHand: s.pose === 'bottle' ? 1 : 0,
    },
    rest: { uL: ruL, fL: rfL, uR: ruR, fR: rfR },
  }
}
