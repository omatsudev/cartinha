'use client'

import { useState, useTransition } from 'react'
import { User, Bell, Heart, Link2, Unlink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveProfileAction, linkPartnerAction, unlinkPartnerAction } from '@/app/(dashboard)/perfil/actions'
import type { UserProfile } from '@/lib/domain/entities/UserProfile'
import { USER_TYPE_LABELS } from '@/lib/domain/enums/UserType'
import { COUPLE_OBJECTIVE_LABELS } from '@/lib/domain/enums/CoupleObjective'

interface Props {
  email: string
  profile: UserProfile | null
  partner: { id: string; name: string } | null
}

export function ProfileForm({ email, profile, partner }: Props) {
  const [, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveProfileAction(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const handleLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => { linkPartnerAction(fd) })
    setPartnerEmail('')
  }

  return (
    <div className="space-y-4">
      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={18} className="text-rose-500" />
            Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
              <p className="text-sm text-gray-700">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
              <input
                name="name"
                defaultValue={profile?.name ?? ''}
                placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Eu sou</label>
              <div className="grid grid-cols-2 gap-2">
                {(['woman', 'man'] as const).map(type => (
                  <label key={type} className="cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value={type}
                      defaultChecked={(profile?.userType ?? 'woman') === type}
                      className="sr-only peer"
                    />
                    <div className="border-2 border-gray-200 peer-checked:border-rose-400 peer-checked:bg-rose-50 rounded-xl p-3 text-center text-sm font-medium text-gray-700 peer-checked:text-rose-700 transition">
                      {USER_TYPE_LABELS[type]}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <input type="hidden" name="notificationsEnabled" value={profile?.notificationsEnabled ? 'true' : 'false'} />
            <input type="hidden" name="notificationHour" value={profile?.notificationHour ?? 8} />

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              {saved ? '✓ Salvo!' : 'Salvar dados'}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Couple objective */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500" />
            Objetivo do casal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(['get_pregnant', 'avoid_pregnancy'] as const).map(obj => (
                <label key={obj} className="cursor-pointer">
                  <input
                    type="radio"
                    name="coupleObjective"
                    value={obj}
                    defaultChecked={profile?.coupleObjective === obj}
                    className="sr-only peer"
                  />
                  <div className="border-2 border-gray-200 peer-checked:border-rose-400 peer-checked:bg-rose-50 rounded-xl p-3 text-center text-sm font-medium text-gray-700 peer-checked:text-rose-700 transition">
                    {COUPLE_OBJECTIVE_LABELS[obj]}
                  </div>
                </label>
              ))}
            </div>

            <input type="hidden" name="name" value={profile?.name ?? ''} />
            <input type="hidden" name="userType" value={profile?.userType ?? 'woman'} />
            <input type="hidden" name="notificationsEnabled" value={profile?.notificationsEnabled ? 'true' : 'false'} />
            <input type="hidden" name="notificationHour" value={profile?.notificationHour ?? 8} />

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Salvar objetivo
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} className="text-rose-500" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Ativar notificações</p>
                <p className="text-xs text-gray-500">Receba alertas personalizados do ciclo</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationsEnabledToggle"
                  defaultChecked={profile?.notificationsEnabled ?? false}
                  onChange={e => {
                    const hidden = e.currentTarget.closest('form')?.querySelector<HTMLInputElement>('input[name="notificationsEnabled"]')
                    if (hidden) hidden.value = e.currentTarget.checked ? 'true' : 'false'
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-rose-500 rounded-full transition peer-focus:ring-2 peer-focus:ring-rose-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Horário preferido</label>
              <select
                name="notificationHour"
                defaultValue={profile?.notificationHour ?? 8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>

            <input type="hidden" name="notificationsEnabled" value={profile?.notificationsEnabled ? 'true' : 'false'} />
            <input type="hidden" name="name" value={profile?.name ?? ''} />
            <input type="hidden" name="userType" value={profile?.userType ?? 'woman'} />
            <input type="hidden" name="coupleObjective" value={profile?.coupleObjective ?? ''} />

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Salvar preferências
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Partner linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 size={18} className="text-rose-500" />
            Vincular parceiro(a)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partner ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                  {(partner.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{partner.name || 'Parceiro(a)'}</p>
                  <p className="text-xs text-green-700">Vinculado</p>
                </div>
              </div>
              <form action={unlinkPartnerAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  <Unlink size={15} />
                  Desvincular
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleLink} className="space-y-3">
              <p className="text-xs text-gray-500">
                Informe o e-mail do(a) seu(sua) parceiro(a) para vincular os perfis e receber notificações cruzadas.
              </p>
              <input
                name="partnerEmail"
                type="email"
                value={partnerEmail}
                onChange={e => setPartnerEmail(e.target.value)}
                placeholder="email@parceiro.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="submit"
                disabled={!partnerEmail}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                Vincular parceiro(a)
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
