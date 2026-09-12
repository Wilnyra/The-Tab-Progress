import { ArrowLeft, Settings } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appName } from '@/shared/lib/constants'
import {
  getProgressPath,
  getRootPath,
  getSettingsPath,
} from '@/shared/lib/routePaths'
import { Button, buttonVariants } from '@/shared/ui/Button'

const readHistoryIndex = (state: unknown): number => {
  if (typeof state !== 'object' || state === null) return 0
  if (!('idx' in state)) return 0
  return typeof state.idx === 'number' ? state.idx : 0
}

export const LayoutHeader = (): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()

  const showBackButton =
    location.pathname === getProgressPath() ||
    location.pathname === getSettingsPath()

  const handleBack = (): void => {
    if (readHistoryIndex(window.history.state) > 0) {
      navigate(-1)
      return
    }
    navigate(getRootPath(), { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b bg-card px-3 text-foreground shadow sm:rounded-b-xl sm:border-x">
      <div className="flex items-center gap-2">
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: showBackButton ? '44px' : '0px',
            opacity: showBackButton ? 1 : 0,
            pointerEvents: showBackButton ? 'auto' : 'none',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="text-base font-semibold transition-all duration-300 ease-in-out whitespace-nowrap">
          <Link to={getRootPath()}>{appName}</Link>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={getSettingsPath()}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          aria-label="Open settings"
        >
          <Settings />
        </Link>
      </div>
    </header>
  )
}
