import { ACTIVITY_IDS } from '../model/types'
import type { ActivityDef, ActivityId, StreakOptions } from '../model/types'
import { clampDay, hashStr } from './math'

export const ACTIVITIES: Readonly<Record<ActivityId, ActivityDef>> = {
  stretch: {
    unlock: 0,
    dur: 1.4,
    label: 'Stretch arms up',
    keys: [
      { t: 35, uL: 160, fL: 8, uR: -160, fR: -8, hand: 1 },
      { t: 65, uL: 160, fL: 8, uR: -160, fR: -8, hand: 1 },
    ],
  },
  shoulders: {
    unlock: 0,
    dur: 1.2,
    label: 'Roll the shoulders',
    keys: [
      { t: 25, uL: 10, uR: -10, torso: -1.5 },
      { t: 50, uL: -4, uR: 4, torso: 0 },
      { t: 75, uL: 10, uR: -10, torso: 1.5 },
    ],
  },
  plant: {
    unlock: 7,
    dur: 1.3,
    label: 'Glance at the plant',
    keys: [
      { t: 35, torso: -7, uL: 32, fL: 6, hand: 1 },
      { t: 70, torso: -7, uL: 32, fL: 6, hand: 1 },
    ],
  },
  watch: {
    unlock: 8,
    dur: 1.2,
    label: 'Check the watch',
    keys: [
      { t: 30, uL: -22, fL: -112, hand: 1 },
      { t: 70, uL: -22, fL: -112, hand: 1 },
    ],
  },
  drink: {
    unlock: 9,
    dur: 1.5,
    label: 'Drink from the bottle',
    keys: [
      { t: 30, uR: 18, fR: 138, hand: 1, bottle: 1 },
      { t: 70, uR: 18, fR: 138, hand: 1, bottle: 1 },
    ],
  },
  lamp: {
    unlock: 21,
    dur: 1.3,
    label: 'Switch the lamp on',
    keys: [
      { t: 40, torso: -4, uL: 118, fL: -12, hand: 1 },
      { t: 60, torso: -4, uL: 118, fL: -12, hand: 1, glow: 1 },
    ],
  },
  book: {
    unlock: 30,
    dur: 1.5,
    label: 'Take a book and open it',
    keys: [
      { t: 30, torso: -9, uL: 30, fL: 4, hand: 1 },
      { t: 45, torso: -9, uL: 30, fL: 4, hand: 1, book: 1 },
      { t: 62, uL: -12, fL: -108, uR: 12, fR: 108, hand: 1, book: 1 },
      { t: 88, uL: -12, fL: -108, uR: 12, fR: 108, hand: 1, book: 1 },
    ],
  },
  desk: {
    unlock: 66,
    dur: 1.5,
    label: 'Step to the desk and write a line',
    keys: [
      { t: 25, dx: 9, thL: -4, thR: 4, hand: 1 },
      { t: 40, dx: 9, uR: 14, fR: 72, hand: 1 },
      { t: 52, dx: 9, uR: 14, fR: 62, hand: 1 },
      { t: 64, dx: 9, uR: 14, fR: 74, hand: 1 },
      { t: 78, dx: 9, thL: 4, thR: -4, hand: 1 },
    ],
  },
  window: {
    unlock: 90,
    dur: 1.5,
    label: 'Step to the window and look out',
    keys: [
      { t: 30, dx: -10, thL: 4, thR: -4, uL: 96, fL: -8, hand: 1 },
      { t: 72, dx: -10, uL: 96, fL: -8, hand: 1 },
    ],
  },
  jacket: {
    unlock: 105,
    dur: 1.3,
    label: 'Sort out the jacket',
    keys: [
      { t: 40, uL: -20, fL: -96, uR: 20, fR: 96, hand: 1 },
      { t: 62, uL: -20, fL: -88, uR: 20, fR: 88, hand: 1 },
    ],
  },
  mat: {
    unlock: 210,
    dur: 1.4,
    label: 'Side stretch on the mat',
    keys: [
      { t: 35, torso: -9, uR: -162, fR: -6, hand: 1 },
      { t: 70, torso: 9, uL: 162, fL: 6, hand: 1 },
    ],
  },
}

export const isActivityId = (value: unknown): value is ActivityId =>
  typeof value === 'string' &&
  (ACTIVITY_IDS as readonly string[]).includes(value)

/** Activities unlocked by the best streak, in catalog order. */
export const listActivities = (
  streak: number,
  opts: StreakOptions = {},
): ActivityId[] => {
  const n = clampDay(streak)
  const best = Math.max(n, clampDay(opts.bestStreak ?? n))
  return ACTIVITY_IDS.filter((id) => best >= ACTIVITIES[id].unlock)
}

/** Deterministic pick: same seed + streak -> same activity. */
export const pickActivity = (
  streak: number,
  seed: string,
  opts: StreakOptions = {},
): ActivityId => {
  const list = listActivities(streak, opts)
  const index = hashStr(`${seed}:${clampDay(streak)}`) % list.length
  // 'stretch' unlocks on day 0, so the list is never empty.
  return list[index] ?? 'stretch'
}
