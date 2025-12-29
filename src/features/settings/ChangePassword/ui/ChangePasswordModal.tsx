import { Key } from 'lucide-react'
import { useState } from 'react'
import { ChangePasswordForm } from './ChangePasswordForm'
import { Button } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'

export const ChangePasswordModal = (): JSX.Element => {
  const [open, setOpen] = useState(false)

  const handleSuccess = (): void => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Key className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
