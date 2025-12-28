import { AccountInfo, LogoutButton } from '@/features/settings/Account'

export const AccountTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Account Information</h3>
        <AccountInfo />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Session</h3>
        <LogoutButton />
      </div>
    </div>
  )
}
