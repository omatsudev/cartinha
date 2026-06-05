import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserId, getNickname } from '@/lib/auth/identity'
import { MessageCircle, Send, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Message {
  id: string
  userId: string
  nickname: string
  message: string
  isSpectator: boolean
  createdAt: string
}

interface ChatPanelProps {
  roomId: string
  isSpectator?: boolean
  className?: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function ChatPanel({ roomId, isSpectator = false, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const userId = getUserId()
  const nickname = getNickname() ?? 'Anônimo'

  useEffect(() => {
    supabase
      .from('card_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data.map(rowToMessage))
      })

    const sub = supabase
      .channel(`chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'card_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => [...prev, rowToMessage(payload.new as Record<string, unknown>)])
        })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function rowToMessage(row: Record<string, unknown>): Message {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      nickname: row.nickname as string,
      message: row.message as string,
      isSpectator: row.is_spectator as boolean,
      createdAt: row.created_at as string,
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    await supabase.from('card_messages').insert({
      room_id: roomId,
      user_id: userId,
      nickname,
      message: text,
      is_spectator: isSpectator,
    })
    setSending(false)
  }

  return (
    <div className={cn('flex flex-col bg-black/40 border border-green-700/40 rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-green-800/50 bg-black/20">
        <MessageCircle className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold text-white">Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-green-600 text-xs text-center py-4 italic">Nenhuma mensagem ainda...</p>
        )}
        {messages.map(msg => {
          const isMe = msg.userId === userId
          return (
            <div key={msg.id} className={cn('flex flex-col gap-0.5', isMe && 'items-end')}>
              <div className={cn('flex items-center gap-1.5 text-xs', isMe ? 'flex-row-reverse' : '')}>
                <span className={cn('font-semibold', isMe ? 'text-green-400' : 'text-blue-300')}>
                  {msg.nickname}
                </span>
                {msg.isSpectator && (
                  <Eye className="w-3 h-3 text-yellow-500" title="Espectador" />
                )}
                <span className="text-green-700">{formatTime(msg.createdAt)}</span>
              </div>
              <div className={cn(
                'text-sm px-3 py-1.5 rounded-2xl max-w-[85%] break-words',
                isMe
                  ? 'bg-green-700 text-white rounded-tr-sm'
                  : 'bg-black/40 text-gray-200 rounded-tl-sm border border-green-800/40',
              )}>
                {msg.message}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2 border-t border-green-800/50">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Mensagem..."
          maxLength={300}
          className="flex-1 bg-black/30 border border-green-800 text-white placeholder-green-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 min-w-0"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl p-2 transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

interface ChatButtonProps {
  roomId: string
  isSpectator?: boolean
  unread: number
  onClick: () => void
}

export function ChatFloatingButton({ unread, onClick }: Pick<ChatButtonProps, 'unread' | 'onClick'>) {
  return (
    <button
      onClick={onClick}
      className="relative bg-green-700 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
    >
      <MessageCircle className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

interface ChatDrawerProps {
  roomId: string
  isSpectator?: boolean
  onClose: () => void
}

export function ChatDrawer({ roomId, isSpectator, onClose }: ChatDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-end sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full sm:w-80 h-[70vh] sm:h-[500px] flex flex-col bg-green-950 sm:rounded-2xl overflow-hidden border border-green-700/50">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-green-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
        <ChatPanel roomId={roomId} isSpectator={isSpectator} className="flex-1 rounded-none border-none" />
      </div>
    </div>
  )
}
