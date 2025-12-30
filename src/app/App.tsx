import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'
import { useAuth } from '@/entities/session'
import { useTheme } from '@/features/settings/ToogleTheme'
import {
  getLoginPath,
  getOnboardingPath,
  getProgressPath,
  getRootPath,
  getSettingsPath,
} from '@/shared/lib/routePaths'
import { Loader } from '@/shared/ui/Loader'
import { Layout } from '@/widgets/Layout'
import './index.css'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/login').then((m) => ({ default: m.LoginPage })),
)
const OnboardingPage = lazy(() =>
  import('@/pages/onboarding').then((m) => ({ default: m.OnboardingPage })),
)
const ProgressPage = lazy(() =>
  import('@/pages/progress').then((m) => ({ default: m.ProgressPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
)

function RequireAuth(): JSX.Element {
  const location = useLocation()
  const { session } = useAuth()

  if (session === undefined)
    return <Loader fullScreen size="lg" text="Loading your session..." />
  if (session) return <Outlet />

  return <Navigate to={getLoginPath()} state={{ from: location }} replace />
}

function App(): JSX.Element {
  useTheme()

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen size="lg" text="Loading..." />}>
        <Routes>
          <Route path={getLoginPath()} element={<LoginPage />} />
          <Route path={getOnboardingPath()} element={<OnboardingPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path={getProgressPath()} element={<ProgressPage />} />
              <Route path={getSettingsPath()} element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={getRootPath()} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
