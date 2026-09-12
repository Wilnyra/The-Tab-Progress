export const filterEventsToLastDays = <T extends { created_at: string }>(
  events: T[],
  days: number,
  now: Date = new Date(),
): T[] => {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  const startMs = start.getTime()
  return events.filter((ev) => new Date(ev.created_at).getTime() >= startMs)
}
