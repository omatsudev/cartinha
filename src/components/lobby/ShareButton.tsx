import { Share2, MessageCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

interface ShareButtonProps {
  code: string
  roomUrl: string
}

export function ShareButton({ code, roomUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const whatsappMsg = encodeURIComponent(
    `🃏 Vamos jogar Cartinha!\nEntre na sala com o código *${code}* ou pelo link:\n${roomUrl}`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`

  async function handleCopy() {
    await navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm sm:text-base"
      >
        <MessageCircle className="w-5 h-5" />
        Convidar pelo WhatsApp
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm border border-white/20"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Link copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
