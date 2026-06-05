import { Link } from 'react-router-dom'
import { Spade, Users, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen felt-table flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-green-700/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          <span className="font-black text-white text-xl">Cartinha</span>
        </div>
        <Link to="/login" className="text-green-300 hover:text-white text-sm font-medium transition-colors">
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
        <div className="text-6xl sm:text-8xl mb-6 select-none">🃏</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
          Sueca & Bisca<br />
          <span className="text-green-400">online com amigos</span>
        </h1>
        <p className="text-green-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Crie uma sala, envie o link pelo WhatsApp e jogue em tempo real com 2 ou 4 jogadores.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center">
          <Link
            to="/cadastro"
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-green-900/50"
          >
            Jogar agora — grátis
          </Link>
          <Link
            to="/login"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto w-full">
          {[
            { icon: Zap, title: 'Tempo real', desc: 'Cada jogada atualiza instantaneamente para todos os jogadores.' },
            { icon: Users, title: '2 ou 4 jogadores', desc: 'Bisca para 2 ou 4. Sueca sempre com 4 em duplas.' },
            { icon: Shield, title: 'Regras automáticas', desc: 'O jogo aplica as regras. Na Sueca, obriga seguir o naipe pedido.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-black/20 border border-green-700/40 rounded-2xl p-5 text-left">
              <div className="w-10 h-10 rounded-xl bg-green-700/50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-green-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Card preview */}
        <div className="mt-16 flex items-end justify-center gap-2 select-none">
          {['A_ouros', '7_copas', 'K_espadas', 'J_paus', 'Q_ouros'].map((code, i) => {
            const [val, suit] = code.split('_')
            const isRed = suit === 'ouros' || suit === 'copas'
            const symbols: Record<string, string> = { ouros: '♦', copas: '♥', espadas: '♠', paus: '♣' }
            const labels: Record<string, string> = { A: 'Ás', K: 'Rei', J: 'Valete', Q: 'Dama' }
            return (
              <div
                key={code}
                style={{ transform: `rotate(${(i - 2) * 8}deg) translateY(${Math.abs(i - 2) * 4}px)` }}
                className="w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-lg card-shadow flex flex-col justify-between p-1.5"
              >
                <span className={`text-xs font-bold ${isRed ? 'text-red-600' : 'text-stone-900'}`}>{labels[val] ?? val}</span>
                <span className={`text-center text-xl ${isRed ? 'text-red-600' : 'text-stone-900'}`}>{symbols[suit]}</span>
                <span className={`text-xs font-bold rotate-180 ${isRed ? 'text-red-600' : 'text-stone-900'}`}>{labels[val] ?? val}</span>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="text-center py-6 text-green-600 text-sm border-t border-green-800">
        © {new Date().getFullYear()} Cartinha · Feito com React + Supabase
      </footer>
    </div>
  )
}
