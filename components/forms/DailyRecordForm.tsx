'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { SENSATION_OPTIONS, type Sensation } from '@/lib/domain/enums/Sensation'
import { MUCUS_APPEARANCE_OPTIONS, type MucusAppearance } from '@/lib/domain/enums/MucusAppearance'
import { MUCUS_QUANTITY_OPTIONS, type MucusQuantity } from '@/lib/domain/enums/MucusQuantity'
import { BLEEDING_INTENSITY_OPTIONS, type BleedingIntensity } from '@/lib/domain/enums/BleedingIntensity'
import type { DailyRecord } from '@/lib/domain/entities/DailyRecord'
import { saveRecordAction } from '@/app/(dashboard)/registrar/actions'

interface DailyRecordFormProps {
  defaultDate: string
  existingRecord?: DailyRecord
}

export function DailyRecordForm({ defaultDate, existingRecord }: DailyRecordFormProps) {
  const router = useRouter()
  const [date, setDate] = useState(existingRecord?.date ?? defaultDate)
  const [sensation, setSensation] = useState<Sensation>(existingRecord?.sensation ?? 'seca')
  const [mucusAppearance, setMucusAppearance] = useState<MucusAppearance>(existingRecord?.mucusAppearance ?? 'nenhum')
  const [mucusQuantity, setMucusQuantity] = useState<MucusQuantity>(existingRecord?.mucusQuantity ?? 'nenhum')
  const [bleedingIntensity, setBleedingIntensity] = useState<BleedingIntensity>(existingRecord?.bleedingIntensity ?? 'nenhum')
  const [notes, setNotes] = useState(existingRecord?.notes ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isMenstruationSelected = sensation === 'menstruacao' || sensation === 'mancha'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await saveRecordAction({
      date,
      sensation,
      mucusAppearance,
      mucusQuantity,
      bleedingIntensity,
      notes,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={defaultDate}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
        />
      </div>

      {/* Sensation — big touch-friendly cards */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          Sensação na vulva{' '}
          <span className="text-xs text-gray-400 font-normal">(registre a mais próxima da fertilidade)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SENSATION_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSensation(value)}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition active:scale-95',
                sensation === value
                  ? 'border-rose-500 bg-rose-50 text-rose-800'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-rose-200',
              )}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-tight">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mucus appearance — hidden when menstruacao/mancha */}
      {!isMenstruationSelected && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Aparência do muco</label>
          <div className="flex flex-wrap gap-2">
            {MUCUS_APPEARANCE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMucusAppearance(value)}
                className={cn(
                  'rounded-full border-2 px-4 py-2 text-sm transition',
                  mucusAppearance === value
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mucus quantity */}
      {!isMenstruationSelected && mucusAppearance !== 'nenhum' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Quantidade</label>
          <div className="flex gap-2">
            {MUCUS_QUANTITY_OPTIONS.filter((o) => o.value !== 'nenhum').map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMucusQuantity(value)}
                className={cn(
                  'flex-1 rounded-xl border-2 py-2.5 text-sm transition',
                  mucusQuantity === value
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bleeding intensity */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Sangramento</label>
        <div className="flex gap-2 flex-wrap">
          {BLEEDING_INTENSITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBleedingIntensity(value)}
              className={cn(
                'rounded-full border-2 px-4 py-2 text-sm transition',
                bleedingIntensity === value
                  ? 'border-rose-500 bg-rose-50 text-rose-800 font-semibold'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          Observações{' '}
          <span className="text-xs text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anote algo que queira lembrar sobre este dia…"
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3.5 text-sm transition"
      >
        {isLoading ? 'Salvando…' : existingRecord ? 'Atualizar registro' : 'Salvar registro'}
      </button>
    </form>
  )
}
