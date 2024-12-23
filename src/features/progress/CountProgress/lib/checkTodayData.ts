export const checkTodayData = (date?: string): boolean => {
  if (!date) return false

  const today = new Date()
  const inputDate = new Date(date)

  return (
    today.getFullYear() === inputDate.getFullYear() &&
    today.getMonth() === inputDate.getMonth() &&
    today.getDate() === inputDate.getDate()
  )
}
