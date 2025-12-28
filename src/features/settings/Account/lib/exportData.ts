import type { PhotoData } from '@/entities/photos'
import type { ProgressData } from '@/entities/progress'
import type { TodoData } from '@/entities/todo'
import { supabase } from '@/shared/lib/supabase'

interface ExportData {
  exportedAt: string
  user: {
    id: string
    email: string | undefined
  }
  data: {
    progress: ProgressData[]
    photos: PhotoData[]
    todos: TodoData[]
  }
}

export const exportAllData = async (): Promise<ExportData> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const [progressResult, photosResult, todosResult] = await Promise.all([
    supabase.from('progress').select('*').order('created_at', { ascending: true }),
    supabase.from('photos').select('*').order('id', { ascending: true }),
    supabase.from('todo').select('*').order('id', { ascending: true }),
  ])

  if (progressResult.error) {
    throw new Error(`Failed to fetch progress data: ${progressResult.error.message}`)
  }

  if (photosResult.error) {
    throw new Error(`Failed to fetch photos data: ${photosResult.error.message}`)
  }

  if (todosResult.error) {
    throw new Error(`Failed to fetch todos data: ${todosResult.error.message}`)
  }

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
    },
    data: {
      progress: progressResult.data as ProgressData[],
      photos: photosResult.data as PhotoData[],
      todos: todosResult.data as TodoData[],
    },
  }

  return exportData
}

export const downloadJSON = (data: ExportData, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export const generateExportFilename = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `the-tab-progress-data-export-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.json`
}
