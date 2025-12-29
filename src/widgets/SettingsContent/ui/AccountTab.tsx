import {
  AccountInfo,
  LogoutButton,
  ExportDataButton,
} from '@/features/settings/Account'
import { ChangePasswordModal } from '@/features/settings/ChangePassword'

export const AccountTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Account Information</h3>
        <AccountInfo />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Change Password</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Update your password to keep your account secure
        </p>
        <ChangePasswordModal />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Data Export</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Download all your data (progress, photos, and todos) as a JSON file
        </p>
        <ExportDataButton />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Session</h3>
        <LogoutButton />
      </div>
    </div>
  )
}
