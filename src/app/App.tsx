import { useAuth } from '@/entities/session'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { getLoginPath, getRootPath } from '@/shared/lib/routePaths'
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'
import './index.css'

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
          <Route index element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to={getRootPath()} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
