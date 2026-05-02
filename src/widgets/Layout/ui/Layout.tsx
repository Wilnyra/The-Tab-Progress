import { Outlet } from 'react-router-dom'
import { LayoutHeader } from './layoutHeader'
import { ProgressContextProvider } from '@/entities/progress'

export const Layout = () => {
  return (
    <ProgressContextProvider>
      <main className="max-w-[1080px] mx-auto px-2 space-y-4 mb-4">
        <LayoutHeader />
        <Outlet />
      </main>
    </ProgressContextProvider>
  )
}
