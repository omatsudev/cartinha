import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError('')
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) { setServerError('E-mail ou senha incorretos'); setLoading(false); return }
    navigate('/criar')
  }

  return (
    <div className="min-h-screen felt-table flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-2xl font-black text-white">Cartinha</h1>
          <p className="text-green-400 text-sm mt-1">Entrar na sua conta</p>
        </div>

        <div className="bg-black/30 border border-green-700/50 rounded-2xl p-6 space-y-4 backdrop-blur">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-300 mb-1">E-mail</label>
              <input
                type="email"
                {...register('email')}
                placeholder="seu@email.com"
                className="w-full bg-black/30 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-700 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-green-300 mb-1">Senha</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-700 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            {serverError && <p className="text-sm text-red-400 bg-red-900/30 rounded-xl px-4 py-3">{serverError}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-green-500 mt-4">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-green-300 font-medium hover:text-white">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
