import {
  analyzeProgressPrompt,
  getLastQueueArray,
  progressContext,
} from '@/entities/progress'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { useContext, useState } from 'react'
import { formatProgress } from '../lib/formatProgress'
import { NotebookPen } from 'lucide-react'

export const GetProgressAnalytics = () => {
  const { progress } = useContext(progressContext)
  const [open, setOpen] = useState(false)

  const formattedProgress = formatProgress(
    getLastQueueArray(progress),
    analyzeProgressPrompt,
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedProgress)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <NotebookPen />
          Analyse Progress
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Your Progress Overview</DialogTitle>
          <DialogDescription>
            Copy your progress below and use it with an AI assistant to get a
            personalized analysis or coaching advice.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={formattedProgress}
          readOnly
          className="min-h-[260px] font-mono text-sm"
        />

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button variant="default" onClick={handleCopy}>
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
