import { lazy } from 'react'

/** Code-split entry: keeps the renderer out of the index bundle. Render
 * inside <Suspense>. */
export const CharacterLazy = lazy(() =>
  import('./Character').then((m) => ({ default: m.Character })),
)
