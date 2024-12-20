import { Outlet } from 'react-router-dom'
import { LayoutHeader } from './layoutHeader'

export const Layout = () => {
  return (
    <main className="max-w-[1080px] mx-auto px-2 space-y-4 mb-4">
      <LayoutHeader />
      <Outlet />
    </main>
  )
}
