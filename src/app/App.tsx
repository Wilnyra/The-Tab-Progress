import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'
import { useAuth } from '@/entities/session'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import {
  getLoginPath,
  getProgressPath,
  getRootPath,
} from '@/shared/lib/routePaths'
import './index.css'
import { Layout } from '@/widgets/Layout'
import { ProgressPage } from '@/pages/progress'

function RequireAuth() {
  const location = useLocation()
  const { session } = useAuth()

  if (session === undefined) return <div>Loading...</div>
  if (session) return <Outlet />

  return <Navigate to={getLoginPath()} state={{ from: location }} replace />
}

function App() {
  return (
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
  )
}

export default App
