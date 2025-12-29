import { Download } from 'lucide-react'
import { useState } from 'react'
import { exportAllData, downloadJSON, generateExportFilename } from '../lib/exportData'
import { Button } from '@/shared/ui/Button'

export const ExportDataButton = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await exportAllData()
      const filename = generateExportFilename()
      downloadJSON(data, filename)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export data'
      setError(errorMessage)

      if (import.meta.env.DEV) {
        console.error('Export failed:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        <Download className="mr-2 h-4 w-4" />
        {isLoading ? 'Exporting...' : 'Export All Data'}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
