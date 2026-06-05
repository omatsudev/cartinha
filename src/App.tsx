import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'
import CreateRoomPage from '@/pages/CreateRoomPage'
import WaitingRoomPage from '@/pages/WaitingRoomPage'
import GamePage from '@/pages/GamePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login', { replace: true })
      else setReady(true)
    })
  }, [])

  return ready ? <>{children}</> : null
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/criar" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/sala/:code" element={<ProtectedRoute><WaitingRoomPage /></ProtectedRoute>} />
        <Route path="/jogo/:roomId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
