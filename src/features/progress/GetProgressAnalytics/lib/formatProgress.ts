import { ProgressData } from '@/entities/progress'

export const formatProgress = (items: ProgressData[], prefix = '') => {
  return prefix + items
    .map((item) => {
      const date = new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const cleanedComment =
        item.comment?.replace(/\n/g, ' ').trim() || null

      return [
        `Day: ${date}`,
        `Value: ${item.value}`,
        cleanedComment ? `Comment: ${cleanedComment}` : null,
        ''
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')
}
