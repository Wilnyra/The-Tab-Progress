import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appName } from '@/shared/lib/constants'
import { getRootPath, getSettingsPath } from '@/shared/lib/routePaths'
import { buttonVariants } from '@/shared/ui/Button'

export const LayoutHeader = (): JSX.Element => {
  return (
    <header className="bg-background h-12 rounded-b-xl px-3 flex items-center border border-t-0 shadow text-foreground justify-between">
      <h1 className="text-base font-semibold">
        <Link to={getRootPath()}>{appName}</Link>
      </h1>
      <div className="flex items-center gap-2">
        <Link
          to={getSettingsPath()}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
          aria-label="Open settings"
        >
          <Settings />
        </Link>
      </div>
    </header>
  )
}
