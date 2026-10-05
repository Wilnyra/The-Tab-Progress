const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

const pad2 = (value: number): string => String(value).padStart(2, '0')

/**
 * Timer clock format: `MM:SS` under one hour, `HH:MM:SS` from one hour on.
 * Non-finite or negative input is treated as 0; fractional seconds are floored.
 */
export const formatSecondsToClock = (seconds: number): string => {
  const safe =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const hours = Math.floor(safe / SECONDS_PER_HOUR)
  const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = safe % SECONDS_PER_MINUTE

  if (hours === 0) return `${pad2(minutes)}:${pad2(secs)}`
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(secs)}`
}
