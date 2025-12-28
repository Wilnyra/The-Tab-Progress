import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'
import { useAuth } from '@/entities/session'
import { SettingsProvider } from '@/entities/settings'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { ProgressPage } from '@/pages/progress'
import {
  getLoginPath,
  getProgressPath,
  getRootPath,
} from '@/shared/lib/routePaths'
import './index.css'
import { Layout } from '@/widgets/Layout'

function RequireAuth(): JSX.Element {
  const location = useLocation()
  const { session } = useAuth()

  if (session === undefined) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center h-screen"
      >
        <span>Loading your session, please wait...</span>
      </div>
    )
  }
  if (session) return <Outlet />

  return <Navigate to={getLoginPath()} state={{ from: location }} replace />
}

function App(): JSX.Element {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path={getLoginPath()} element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path={getProgressPath()} element={<ProgressPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={getRootPath()} />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
