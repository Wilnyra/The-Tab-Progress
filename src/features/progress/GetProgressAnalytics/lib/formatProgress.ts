import type { ProgressData } from '@/entities/progress'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'

export const formatProgress = (items: ProgressData[], prefix = '') => {
  return prefix + items
    .map((item) => {
      const date = new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const duration = formatSecondsToTime(item.duration_seconds)
      const cleanedComment =
        item.comment?.replace(/\n/g, ' ').trim() || null

      return [
        `Day: ${date}`,
        `Duration: ${duration}`,
        cleanedComment ? `Comment: ${cleanedComment}` : null,
        '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')
}
