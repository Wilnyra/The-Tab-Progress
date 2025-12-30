import { ArrowLeft, Settings } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appName } from '@/shared/lib/constants'
import {
  getProgressPath,
  getRootPath,
  getSettingsPath,
} from '@/shared/lib/routePaths'
import { Button, buttonVariants } from '@/shared/ui/Button'

export const LayoutHeader = (): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()

  const showBackButton =
    location.pathname === getProgressPath() ||
    location.pathname === getSettingsPath()

  const handleBack = (): void => {
    navigate(getRootPath())
  }

  return (
    <header className="bg-background h-12 rounded-b-xl px-3 flex items-center border border-t-0 shadow text-foreground justify-between">
      <div className="flex items-center gap-2">
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: showBackButton ? '32px' : '0px',
            opacity: showBackButton ? 1 : 0,
            pointerEvents: showBackButton ? 'auto' : 'none',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            aria-label="Go back to dashboard"
            className="h-8 w-8 p-0 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-base font-semibold transition-all duration-300 ease-in-out whitespace-nowrap">
          <Link to={getRootPath()}>{appName}</Link>
        </h1>
      </div>
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
