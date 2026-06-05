import Link from 'next/link'
import { LogOut, Bell } from 'lucide-react'

interface HeaderProps {
  userName?: string
  unreadNotifications?: number
}

export function Header({ userName, unreadNotifications = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-rose-100">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-bold text-rose-700 text-sm">Cicla MOB</span>
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
          )}

          <Link
            href="/notificacoes"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full px-1">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-600 transition py-1.5 px-2 rounded-lg hover:bg-rose-50"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
