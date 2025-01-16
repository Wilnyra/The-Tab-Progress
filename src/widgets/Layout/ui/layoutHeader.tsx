import { appName } from '@/shared/lib/constants'
import { getRootPath } from '@/shared/lib/routePaths'
import { Link } from 'react-router-dom'

export const LayoutHeader = () => {
  return (
    <header className="bg-background h-12 rounded-b-xl px-3 flex items-center border border-t-0 shadow text-foreground">
      <Link to={getRootPath()}>{appName}</Link>
    </header>
  )
}
