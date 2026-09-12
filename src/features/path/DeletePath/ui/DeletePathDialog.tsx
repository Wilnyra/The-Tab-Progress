import { useState } from 'react'
import { deletePath } from '@/entities/path'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'

type DeletePathDialogProps = {
  pathId: string
  step: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export const DeletePathDialog = ({
  pathId,
  step,
  open,
  onOpenChange,
  onComplete,
}: DeletePathDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean): void => {
    if (!next) setError(null)
    onOpenChange(next)
  }

  const handleCancel = (): void => handleOpenChange(false)

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return
    setIsDeleting(true)
    setError(null)
    const { error: deleteError } = await deletePath(pathId)
    setIsDeleting(false)
    if (deleteError) {
      setError(`Couldn't delete the milestone. ${deleteError.message}`)
      return
    }
    onComplete?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete milestone?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this milestone? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm bg-muted p-3 rounded-md">{step}</p>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
