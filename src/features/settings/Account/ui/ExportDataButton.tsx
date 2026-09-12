import { Download } from 'lucide-react'
import { useState } from 'react'
import {
  exportAllData,
  downloadJSON,
  generateExportFilename,
} from '../lib/exportData'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'

export const ExportDataButton = (): JSX.Element => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async (): Promise<void> => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const data = await exportAllData()
      const filename = generateExportFilename()
      downloadJSON(data, filename)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export data'
      showToast({
        message: `Couldn't export your data. ${errorMessage}`,
        variant: 'error',
      })

      if (import.meta.env.DEV) {
        console.error('Export failed:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? 'Exporting...' : 'Export All Data'}
    </Button>
  )
}
