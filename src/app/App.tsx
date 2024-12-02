import { LoginPage } from "@/pages/login"
import "./index.css"
import { getLoginPath, getRootPath } from "@/shared/lib/routePaths"
import { BrowserRouter, Route, Routes, Navigate, useLocation, Outlet } from "react-router-dom"
import { DashboardPage } from "@/pages/dashboard"
import { getIsAuthed } from "@/entities/session"

function RequireAuth() {
  const location = useLocation()
  const isAuthenticated = getIsAuthed()
  console.log('::isAuthenticated', isAuthenticated)

  if (isAuthenticated) return <Outlet />
  else {
    return <Navigate to={getLoginPath()} state={{ from: location }} replace />
  }
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
