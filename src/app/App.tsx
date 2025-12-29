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
import { SettingsPage } from '@/pages/settings'
import {
  getLoginPath,
  getProgressPath,
  getRootPath,
  getSettingsPath,
} from '@/shared/lib/routePaths'
import { Loader } from '@/shared/ui/Loader'
import { Layout } from '@/widgets/Layout'
import './index.css'

function RequireAuth(): JSX.Element {
  const location = useLocation()
  const { session } = useAuth()

  if (session === undefined) {
    return <Loader fullScreen size="lg" text="Loading your session..." />
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
              <Route path={getSettingsPath()} element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={getRootPath()} />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
