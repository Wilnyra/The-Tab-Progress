export type Side = 'L' | 'R'

export const ACTIVITY_IDS = [
  'stretch',
  'shoulders',
  'plant',
  'watch',
  'drink',
  'lamp',
  'book',
  'desk',
  'window',
  'jacket',
  'mat',
] as const

export type ActivityId = (typeof ACTIVITY_IDS)[number]

/** One keyframe of a clip. Arm keys are relative to the relaxed arm,
 * leg keys are deltas on the idle stance, torso is absolute. */
export type ActivityKey = {
  t: number
  uL?: number
  fL?: number
  uR?: number
  fR?: number
  thL?: number
  shL?: number
  thR?: number
  shR?: number
  torso?: number
  dx?: number
  hand?: 1
  bottle?: 1
  book?: 1
  glow?: 1
}

export type ActivityDef = {
  unlock: number
  dur: number
  label: string
  keys: readonly ActivityKey[]
}

export type Pose =
  | 'seated'
  | 'pockets'
  | 'relaxed'
  | 'bottle'
  | 'crossed'
  | 'pocketOne'
  | 'hips'
  | 'overShoulder'
  | 'open'

export type HairStyle = 'messy' | 'combed' | 'cut' | 'styled' | 'full'
export type Sleeves = 'long' | 'pushed' | 'short'
export type Tuck = 'none' | 'front' | 'full'
export type Trousers = 'joggers' | 'straight' | 'dark' | 'tapered' | 'pressed'
export type Shoes = 'old' | 'white' | 'leather'
export type Neckline = 'crew' | 'henley' | 'collar'
export type JacketMode = 'waist' | 'shoulder' | 'worn'

export type FigureState = {
  n: number
  best: number
  resting: boolean
  pose: Pose
  posture: number
  evenWeight: boolean
  body: number
  laces: boolean
  hair: HairStyle
  sleeves: Sleeves
  smooth: boolean
  keys: boolean
  tuck: Tuck
  belt: 'leather' | 'plain' | null
  watch: 'metal' | 'basic' | null
  bottle: boolean
  trousers: Trousers
  fitted: boolean
  wristband: 'leather' | 'band' | null
  shoes: Shoes
  stripe: boolean
  crossbody: boolean
  backpack: boolean
  bagHigh: boolean
  cuffs: boolean
  top: 0 | 1 | 2
  necklace: boolean
  neckline: Neckline
  notebook: boolean
  socks: boolean
  headphones: boolean
  jacket: JacketMode | null
  jacketTone: 0 | 1
  pen: boolean
}

export type Point = readonly [number, number]

export type FigureSkeleton = {
  u: number
  b: number
  sy: number
  droop: number
  sw: number
  ww: number
  hw: number
  nw: number
  aw: number
  hcy: number
  neck: Point
  hip: number
  hipDy: number
  thigh: number
  shin: number
  foot: number
  upper: number
  fore: number
  shoulderL: Point
  shoulderR: Point
  SL: Point
  SR: Point
}

export type ArmAngles = {
  uL: number
  fL: number
  uR: number
  fR: number
}

export type IdleAngles = ArmAngles & {
  thL: number
  shL: number
  thR: number
  shR: number
  handL: 0 | 1
  handR: 0 | 1
  bottleInHand: 0 | 1
}

export type StreakOptions = {
  bestStreak?: number
}

export type StaticFigureOptions = StreakOptions & {
  ghostDay?: number
  ghostDaysAgo?: number
  futureSelf?: boolean
}

export type RenderFigureOptions = StreakOptions & {
  ghostDay?: number
  futureSelf?: boolean
  animate?: boolean
  activity?: ActivityId
  seed?: string
  /** CSS-safe suffix that keeps two figures' keyframes apart. */
  instance?: string
}

export type CatalogKind =
  | 'start'
  | 'clothes'
  | 'grooming'
  | 'pose'
  | 'accessory'

export type CatalogEntry = {
  day: number
  kind: CatalogKind
  text: string
}

export type RoomEntry = {
  day: number
  text: string
}

export type NextChange = {
  day: number
  label: string
  inDays: number
}
