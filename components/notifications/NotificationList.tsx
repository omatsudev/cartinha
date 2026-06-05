'use client'

import { useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { markNotificationReadAction, markAllReadAction } from '@/app/(dashboard)/notificacoes/actions'
import type { AppNotification } from '@/lib/domain/entities/AppNotification'

const TYPE_ICONS: Record<string, string> = {
  pms: '🌙',
  fertile_period: '🌸',
  peak_fertility: '✨',
  return_infertile: '🍃',
  daily_reminder: '📝',
}

interface Props {
  notifications: AppNotification[]
}

export function NotificationList({ notifications }: Props) {
  const [, startTransition] = useTransition()

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-10 pb-10 text-center">
          <Bell size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma notificação ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Elas aparecerão conforme seu ciclo avança.</p>
        </CardContent>
      </Card>
    )
  }

  const hasUnread = notifications.some(n => !n.readAt)

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={() => startTransition(() => markAllReadAction())}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:underline"
          >
            <CheckCheck size={14} />
            Marcar todas como lidas
          </button>
        </div>
      )}

      {notifications.map(notification => (
        <Card
          key={notification.id}
          className={notification.readAt ? 'opacity-60' : 'border-rose-100 shadow-sm'}
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {TYPE_ICONS[notification.type] ?? '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                  {!notification.readAt && (
                    <button
                      onClick={() => startTransition(() => markNotificationReadAction(notification.id))}
                      className="flex-shrink-0 text-gray-400 hover:text-rose-600 transition"
                      title="Marcar como lida"
                    >
                      <Check size={15} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-[11px] text-gray-400 mt-2">
                  {format(parseISO(notification.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
