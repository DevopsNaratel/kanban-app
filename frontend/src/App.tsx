import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import LandingPage from "./LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import AllTasksPage from "./pages/dashboard/AllTasksPage"
import BoardPage from "./pages/board/BoardPage"
import SettingsPage from "./pages/settings/SettingsPage"
import NotFoundPage from "./pages/NotFoundPage"
import { KanbanProvider } from "@/context/KanbanContext"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<KanbanProvider><Outlet /></KanbanProvider>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<AllTasksPage />} />
              <Route path="/board/:boardId" element={<BoardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App