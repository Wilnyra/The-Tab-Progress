import { Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/entities/session'
import { cn } from '@/shared/lib/cn'
import { getSettingsPath } from '@/shared/lib/routePaths'
import { buttonVariants } from '@/shared/ui/Button'

const ACCOUNT_SETTINGS_LINK = {
  pathname: getSettingsPath(),
  search: '?section=account',
}

const formatMemberSince = (iso: string): string | null => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const Avatar = ({ email }: { email: string | null }): JSX.Element => {
  const initial = email?.trim().charAt(0).toUpperCase() ?? ''

  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
    >
      {initial !== '' ? initial : <User className="h-6 w-6" />}
    </div>
  )
}

export const ProfileIdentity = (): JSX.Element => {
  const { session } = useAuth()
  const email = session?.user?.email ?? null
  const createdAt = session?.user?.created_at
  const memberSince =
    createdAt !== undefined ? formatMemberSince(createdAt) : null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto sm:flex-1">
        <Avatar email={email} />
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium">{email ?? 'Signed in'}</p>
          {memberSince !== null ? (
            <p className="text-sm text-muted-foreground">
              Member since {memberSince}
            </p>
          ) : null}
        </div>
      </div>
      <Link
        to={ACCOUNT_SETTINGS_LINK}
        className={cn(buttonVariants({ variant: 'ghost' }), '-mx-3 gap-2 px-3')}
      >
        <Settings aria-hidden="true" />
        Account settings
      </Link>
    </div>
  )
}
