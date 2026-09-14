const neighboursOf = (
  index: number,
  width: number,
  height: number,
): number[] => {
  const x = index % width
  const y = Math.floor(index / width)
  const result: number[] = []
  if (x > 0) result.push(index - 1)
  if (x < width - 1) result.push(index + 1)
  if (y > 0) result.push(index - width)
  if (y < height - 1) result.push(index + width)
  return result
}

export const largestLandComponent = (
  terrain: string,
  width: number,
  height: number,
): Set<number> => {
  const total = width * height
  const seen = new Uint8Array(total)
  let best: number[] = []

  for (let start = 0; start < total; start += 1) {
    if (terrain[start] === 'w' || seen[start] === 1) continue
    seen[start] = 1
    const stack = [start]
    const component: number[] = []
    while (stack.length > 0) {
      const index = stack.pop()
      if (index === undefined) break
      component.push(index)
      for (const next of neighboursOf(index, width, height)) {
        if (terrain[next] === 'w' || seen[next] === 1) continue
        seen[next] = 1
        stack.push(next)
      }
    }
    if (component.length > best.length) best = component
  }

  return new Set(best)
}

export const countHardIslands = (
  terrain: string,
  width: number,
  height: number,
): number => {
  const total = width * height
  const seen = new Uint8Array(total)
  let islands = 0

  for (let start = 0; start < total; start += 1) {
    if (terrain[start] !== 'h' || seen[start] === 1) continue
    islands += 1
    seen[start] = 1
    const stack = [start]
    while (stack.length > 0) {
      const index = stack.pop()
      if (index === undefined) break
      for (const next of neighboursOf(index, width, height)) {
        if (terrain[next] !== 'h' || seen[next] === 1) continue
        seen[next] = 1
        stack.push(next)
      }
    }
  }

  return islands
}
