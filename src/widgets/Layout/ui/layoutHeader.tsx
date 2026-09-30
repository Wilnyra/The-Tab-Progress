import { ArrowLeft, Menu, Settings, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appName } from '@/shared/lib/constants'
import {
  getPathPath,
  getProfilePath,
  getProgressPath,
  getRootPath,
  getSettingsPath,
} from '@/shared/lib/routePaths'
import { Button } from '@/shared/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu'

const MENU_ITEM_CLASS = 'min-h-11 cursor-pointer gap-2 sm:min-h-8'

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
    location.pathname === getPathPath() ||
    location.pathname === getProfilePath() ||
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="h-11 w-11"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
            <Link to={getProfilePath()}>
              <User className="h-4 w-4" aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
            <Link to={getSettingsPath()}>
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
