import { type ReactElement, useId, useMemo, useState } from 'react'
import { localDayKey } from '../lib/localDayKey'
import { renderFigure } from '../lib/renderFigure'
import { cn } from '@/shared/lib/cn'
import { sanitizeSvg } from '@/shared/lib/sanitizeSvg'
import { usePrefersReducedMotion } from '@/shared/lib/usePrefersReducedMotion'

export type CharacterProps = {
  streak: number
  bestStreak?: number
  animate?: boolean
  className?: string
}

const toCssIdent = (id: string): string => id.replace(/[^A-Za-z0-9_-]/g, '')

/**
 * The streak character. Plays today's short activity once on mount and
 * again only when the inputs change (the SVG string is memoized, and React
 * leaves the DOM alone while the markup is the same).
 */
export const Character = ({
  streak,
  bestStreak,
  animate = true,
  className,
}: CharacterProps): ReactElement => {
  const reactId = useId()
  // Seed fixed for the life of the mount: the activity is stable all day.
  const [seedDate] = useState(() => localDayKey(new Date()))
  const reducedMotion = usePrefersReducedMotion()

  const instance = toCssIdent(reactId)
  const shouldAnimate = animate && !reducedMotion
  const markup = useMemo(
    () =>
      sanitizeSvg(
        renderFigure(streak, {
          bestStreak,
          seed: seedDate,
          animate: shouldAnimate,
          instance,
        }),
      ),
    [streak, bestStreak, seedDate, shouldAnimate, instance],
  )
  // Sanitized by sanitizeSvg (src/shared/lib/sanitizeSvg.ts): element and
  // attribute allowlist, no handlers, no href, no url().
  const html = useMemo(() => ({ __html: markup }), [markup])

  return (
    <div
      className={cn(
        'shrink-0 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full',
        className,
      )}
      dangerouslySetInnerHTML={html}
    />
  )
}
