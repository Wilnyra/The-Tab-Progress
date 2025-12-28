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
  const handleDelete = () => {
    deletePath(pathId).then(() => {
      onComplete?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Achievement</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this achievement? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm bg-muted p-3 rounded-md">{step}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
