import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'

const SECONDS_PER_MINUTE = 60

export const formatSessionDuration = (seconds: number): string =>
  seconds < SECONDS_PER_MINUTE
    ? `${Math.max(0, Math.floor(seconds))}s`
    : formatMinutesToHm(seconds / SECONDS_PER_MINUTE)
