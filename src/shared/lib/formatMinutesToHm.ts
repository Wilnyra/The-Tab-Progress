export const formatMinutesToHm = (minutes: number): string => {
  if (!Number.isFinite(minutes)) return '0m'
  const total = Math.max(0, Math.round(minutes))
  const hours = Math.floor(total / 60)
  const mins = total % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}
