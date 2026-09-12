import { Outlet } from 'react-router-dom'
import { LayoutHeader } from './layoutHeader'
import { ProgressContextProvider } from '@/entities/progress'

export const Layout = () => {
  return (
    <ProgressContextProvider>
      <main className="max-w-[1080px] mx-auto mb-2 space-y-2 sm:mb-4 sm:space-y-4 sm:px-2">
        <LayoutHeader />
        <Outlet />
      </main>
    </ProgressContextProvider>
  )
}
