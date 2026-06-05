import { useState } from 'react'
import { setNickname } from '@/lib/auth/identity'

interface NicknameModalProps {
  onConfirm: (nickname: string) => void
}

export function NicknameModal({ onConfirm }: NicknameModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleConfirm() {
    const trimmed = value.trim()
    if (trimmed.length < 2) { setError('Mínimo 2 caracteres'); return }
    if (trimmed.length > 20) { setError('Máximo 20 caracteres'); return }
    setNickname(trimmed)
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-felt-dark border border-green-700/60 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-2xl font-black text-white">Cartinha</h1>
          <p className="text-green-400 text-sm mt-1">Bisca & Sueca</p>
        </div>

        <p className="text-green-300 text-sm font-medium mb-2">Como quer ser chamado?</p>
        <input
          autoFocus
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          placeholder="Seu apelido"
          maxLength={20}
          className="w-full bg-black/30 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-700 outline-none focus:border-green-400 transition text-base mb-1"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!value.trim()}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl py-3 transition text-base"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
