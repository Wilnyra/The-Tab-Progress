import { Key } from 'lucide-react'
import type { PasswordFormMode } from '../model/changePasswordSchema'
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
import { useToast } from '@/shared/ui/Toast'

type ChangePasswordModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: PasswordFormMode
}

export const ChangePasswordModal = ({
  open,
  onOpenChange,
  mode = 'change',
}: ChangePasswordModalProps): JSX.Element => {
  const { showToast } = useToast()
  const isRecovery = mode === 'recovery'

  const handleSuccess = (): void => {
    onOpenChange(false)
    showToast({ message: 'Password updated' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Key className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRecovery ? 'Set a new password' : 'Change password'}
          </DialogTitle>
          <DialogDescription>
            {isRecovery
              ? 'Choose a new password for your account'
              : 'Enter your current password and choose a new one'}
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm key={mode} mode={mode} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
