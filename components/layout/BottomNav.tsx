'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Calendar, Bell, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Início' },
  { href: '/registrar', icon: PlusCircle, label: 'Registrar' },
  { href: '/calendario', icon: Calendar, label: 'Calendário' },
  { href: '/notificacoes', icon: Bell, label: 'Alertas' },
  { href: '/perfil', icon: UserCircle, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition',
                isActive ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
