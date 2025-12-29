import { User } from 'lucide-react'
import { useAuth } from '@/entities/session'
import { Label } from '@/shared/ui/Label'

export const AccountInfo = (): JSX.Element => {
  const { session } = useAuth()

  const userEmail = session?.user?.email ?? 'No email'
  const userId = session?.user?.id ?? 'No ID'
  const createdAt = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString()
    : 'Unknown'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">{userEmail}</p>
          <p className="text-xs text-muted-foreground">Member since {createdAt}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>User ID</Label>
        <p className="text-sm text-muted-foreground font-mono break-all">
          {userId}
        </p>
      </div>
    </div>
  )
}
