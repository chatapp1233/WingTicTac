import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AuthenticatedShell } from './components/layout/AuthenticatedShell'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ChatsPage } from './pages/ChatsPage'
import { PlayPage } from './pages/PlayPage'

function LandingGate() {
  const status = useAuthStore((s) => s.status)
  if (status === 'authenticated') return <Navigate to="/chats" replace />
  return <LandingPage />
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingGate />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedShell />}>
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chats/:conversationId" element={<ChatsPage />} />
            <Route path="/play" element={<PlayPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
