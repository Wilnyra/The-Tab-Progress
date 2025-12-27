import { Link } from 'react-router-dom'
import { ToogleTheme } from '@/features/settings/ToogleTheme'
import { appName } from '@/shared/lib/constants'
import { getRootPath } from '@/shared/lib/routePaths'

export const LayoutHeader = () => {
  return (
    <header className="bg-background h-12 rounded-b-xl px-3 flex items-center border border-t-0 shadow text-foreground justify-between">
      <Link to={getRootPath()}>{appName}</Link>
      <ToogleTheme />
    </header>
  )
}
