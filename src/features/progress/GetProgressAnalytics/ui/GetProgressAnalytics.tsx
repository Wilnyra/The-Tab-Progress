import { Check, Copy, NotebookPen } from 'lucide-react'
import { useCallback, useContext, useState } from 'react'
import { formatProgress } from '../lib/formatProgress'
import {
  analyzeProgressPrompt,
  getLastQueueArray,
  progressContext,
} from '@/entities/progress'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { Textarea } from '@/shared/ui/Textarea'

const DIALOG_TITLE = 'Your Progress Overview'
const DIALOG_DESCRIPTION =
  'Copy your progress below and use it with an AI assistant to get a personalized analysis or coaching advice.'

export const GetProgressAnalytics = () => {
  const { progress } = useContext(progressContext)
  const [open, setOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const formattedProgress = formatProgress(
    getLastQueueArray(progress),
    analyzeProgressPrompt,
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedProgress)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }, [formattedProgress])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <NotebookPen size={16} />
          Analyse Progress
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <Textarea
          value={formattedProgress}
          readOnly
          className="min-h-[260px] font-mono text-sm"
        />

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleCopy}
            disabled={isCopied}
            className="gap-2"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
