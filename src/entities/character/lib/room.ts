// The environment: the room fills in at milestones (earned, kept after
// a break). Flat, muted tones; stays secondary to the person.
import { r2 } from './math'

const v = (name: string, fallback: string): string =>
  `hsl(var(--${name}, ${fallback}))`

export const R = {
  wood: v('room-wood', '30 18% 80%'),
  woodShade: v('room-wood-shade', '30 16% 71%'),
  plant: v('room-plant', '140 14% 62%'),
  plantDark: v('room-plant-dark', '145 14% 52%'),
  pot: v('room-pot', '20 18% 74%'),
  frame: v('room-frame', '220 6% 72%'),
  art1: v('room-art-1', '200 18% 87%'),
  art2: v('room-art-2', '28 30% 86%'),
  book1: v('room-book-1', '210 14% 72%'),
  book2: v('room-book-2', '15 24% 74%'),
  book3: v('room-book-3', '45 26% 76%'),
  windowFrame: v('room-window-frame', '220 6% 82%'),
  glass: v('room-glass', '200 45% 93%'),
  curtain: v('room-curtain', '35 20% 88%'),
  rug: v('room-rug', '30 14% 91%'),
  lampPole: v('room-lamp-pole', '220 6% 62%'),
  shade: v('room-shade', '40 30% 86%'),
  glow: v('room-glow', '42 85% 82%'),
  wall: v('room-wall', '35 22% 96%'),
} as const

type RoomColorKey = keyof typeof R
type BookSpec = readonly [height: number, width: number, key: RoomColorKey]

const books = (x: number, y: number, list: readonly BookSpec[]): string => {
  let cx = x
  return list
    .map(([h, w, key]) => {
      const r = `<rect x="${r2(cx)}" y="${r2(y - h)}" width="${w}" height="${h}" fill="${R[key]}"/>`
      cx += w + 0.5
      return r
    })
    .join('')
}

export const drawRoom = (g: number, hint = false): string => {
  const o: string[] = []
  const F = 156
  if (g >= 365 && !hint)
    o.push(
      `<rect x="2" y="4" width="116" height="${F - 4}" rx="10" fill="${R.wall}" opacity="0.8"/>`,
    )
  if (g >= 90) {
    o.push(
      `<rect x="8" y="14" width="27" height="36" rx="1" fill="${R.windowFrame}"/><rect x="10" y="16" width="10.5" height="32" fill="${R.glass}"/><rect x="22.5" y="16" width="10.5" height="32" fill="${R.glass}"/>`,
    )
    if (g >= 365)
      o.push(
        `<rect x="5" y="12" width="5" height="40" rx="1.5" fill="${R.curtain}"/><rect x="33" y="12" width="5" height="40" rx="1.5" fill="${R.curtain}"/>`,
      )
  }
  if (g >= 14)
    o.push(
      `<rect x="88" y="20" width="18" height="22" fill="${R.frame}"/><rect x="90" y="22" width="14" height="18" fill="${R.art1}"/><path d="M90 36 L95 30 L99 34 L101 32 L104 36 L104 40 L90 40 Z" fill="${R.book1}"/>`,
    )
  if (g >= 270)
    o.push(
      `<rect x="98" y="46" width="11" height="13" fill="${R.frame}"/><rect x="99.5" y="47.5" width="8" height="10" fill="${R.art2}"/>`,
    )
  if (g >= 120)
    o.push(
      `<rect x="84" y="78" width="30" height="2" fill="${R.woodShade}"/>` +
        books(86, 78, [
          [8, 2.4, 'book1'],
          [9, 2, 'book3'],
          [7, 2.6, 'book2'],
          [8.5, 2.2, 'book1'],
        ]) +
        `<path d="M104 78 L110 72.5 L111.4 74 L105.6 78 Z" fill="${R.book2}"/>`,
    )
  if (g >= 42)
    o.push(
      `<rect x="26" y="${F - 2.6}" width="68" height="3.2" rx="1.6" fill="${R.rug}"/>`,
    )
  if (g >= 21) {
    const lx = g >= 30 ? 33 : 24
    if (g >= 270 && !hint)
      o.push(
        `<circle cx="${lx}" cy="70" r="13" fill="${R.glow}" opacity="0.45"/>`,
      )
    o.push(
      `<rect x="${lx - 0.6}" y="72" width="1.2" height="${F - 72}" fill="${R.lampPole}"/><rect x="${lx - 4}" y="${F - 1.4}" width="8" height="1.4" rx="0.7" fill="${R.lampPole}"/>`,
    )
    o.push(
      `<path d="M${lx - 5} 72 L${lx + 5} 72 L${lx + 3.4} 64 L${lx - 3.4} 64 Z" fill="${R.shade}"/>`,
    )
  }
  if (g >= 30) {
    o.push(
      `<rect x="4" y="128" width="22" height="${F - 128}" fill="${R.wood}"/><rect x="4" y="141" width="22" height="1.4" fill="${R.woodShade}"/>`,
    )
    o.push(
      books(6, 141, [
        [8, 2.4, 'book1'],
        [9.5, 2, 'book2'],
        [7.5, 2.6, 'book3'],
      ]) +
        books(6, F, [
          [9, 2.6, 'book3'],
          [10, 2.2, 'book1'],
          [8, 2.4, 'book2'],
          [9.5, 2, 'book1'],
        ]),
    )
  }
  if (g >= 7) {
    const [px, py] = g >= 30 ? [19, 128] : [12, F]
    const z = g >= 180 ? 1.7 : 1
    o.push(
      `<path d="M${px - 3} ${py - 6} L${px + 3} ${py - 6} L${px + 2.2} ${py} L${px - 2.2} ${py} Z" fill="${R.pot}"/>`,
    )
    o.push(
      `<g transform="translate(${px} ${py - 6}) scale(${z}) translate(${-px} ${-(py - 6)})"><ellipse cx="${px - 2.4}" cy="${py - 9}" rx="2.2" ry="3.6" fill="${R.plant}" transform="rotate(-25 ${px - 2.4} ${py - 9})"/><ellipse cx="${px + 2.4}" cy="${py - 9.4}" rx="2.2" ry="3.8" fill="${R.plantDark}" transform="rotate(25 ${px + 2.4} ${py - 9.4})"/><ellipse cx="${px}" cy="${py - 11}" rx="1.8" ry="3.6" fill="${R.plant}"/></g>`,
    )
  }
  if (g >= 66) {
    o.push(
      `<rect x="93" y="121" width="25" height="2.6" rx="0.8" fill="${R.wood}"/><rect x="95" y="123.6" width="1.8" height="${F - 123.6}" fill="${R.woodShade}"/><rect x="114.4" y="123.6" width="1.8" height="${F - 123.6}" fill="${R.woodShade}"/>`,
    )
    o.push(
      `<path d="M96 121 L103 119.4 L110 121 Z" fill="${R.art1}"/><path d="M103 119.4 L103 121" stroke="${R.frame}" stroke-width="0.5"/><rect x="111.6" y="116.4" width="3.4" height="4.6" rx="0.8" fill="${R.book2}"/>`,
    )
  }
  if (g >= 210)
    o.push(
      `<rect x="26.6" y="128" width="4.2" height="${F - 128}" rx="2.1" fill="${R.book1}" transform="rotate(-6 28.7 ${F})"/>`,
    )
  return o.join('')
}
