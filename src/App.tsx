import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { hasNickname } from '@/lib/auth/identity'
import { NicknameModal } from '@/components/ui/NicknameModal'
import CreateRoomPage from '@/pages/CreateRoomPage'
import WaitingRoomPage from '@/pages/WaitingRoomPage'
import GamePage from '@/pages/GamePage'

export default function App() {
  const [nicknameSet, setNicknameSet] = useState(hasNickname)

  if (!nicknameSet) {
    return <NicknameModal onConfirm={() => setNicknameSet(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateRoomPage />} />
        <Route path="/sala/:code" element={<WaitingRoomPage />} />
        <Route path="/jogo/:roomId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
