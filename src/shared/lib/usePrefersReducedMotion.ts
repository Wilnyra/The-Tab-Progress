import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const getMediaQuery = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : null

const subscribe = (onChange: () => void): (() => void) => {
  const mq = getMediaQuery()
  if (!mq) return () => {}
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = (): boolean => getMediaQuery()?.matches ?? false

const getServerSnapshot = (): boolean => false

/** Live `prefers-reduced-motion: reduce`; no state, no stale listeners. */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
