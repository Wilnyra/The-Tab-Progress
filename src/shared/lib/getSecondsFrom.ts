export const getSecondsFrom = (startTime: string | null) => {
  if (!startTime) return 0

  const initialDate = new Date(startTime)
  const now = new Date()

  return Math.floor((now.getTime() - initialDate.getTime()) / 1000)
}
