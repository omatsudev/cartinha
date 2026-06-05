import { cn } from '@/lib/utils/cn'
import { parseCard, CARD_LABEL, CardValue } from '@/lib/domain/entities/Card'
import { SUIT_SYMBOL } from '@/lib/domain/enums/Suit'
import { Suit } from '@/lib/domain/enums/Suit'

interface CardProps {
  code: string
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  faceDown?: boolean
  className?: string
}

const sizes = {
  sm: { card: 'w-14 h-20 sm:w-16 sm:h-24', label: 'text-[10px]', sym: 'text-[12px]', pad: 'p-[3px]' },
  md: { card: 'w-18 h-24 sm:w-20 sm:h-28', label: 'text-[12px]', sym: 'text-[14px]', pad: 'p-1' },
  lg: { card: 'w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36', label: 'text-[14px]', sym: 'text-[17px]', pad: 'p-[5px]' },
}

// Pip positions in "0 0 100 140" viewBox. y > 71 = inverted (bottom half)
const PIP_POSITIONS: Record<string, [number, number][]> = {
  A:   [[50, 70]],
  '2': [[50, 30], [50, 110]],
  '3': [[50, 30], [50, 70], [50, 110]],
  '4': [[30, 33], [70, 33], [30, 107], [70, 107]],
  '5': [[30, 33], [70, 33], [50, 70], [30, 107], [70, 107]],
  '6': [[30, 33], [70, 33], [30, 70], [70, 70], [30, 107], [70, 107]],
  '7': [[30, 33], [70, 33], [50, 52], [30, 70], [70, 70], [30, 107], [70, 107]],
}

const COURT_VALUES: CardValue[] = ['K', 'Q', 'J']

// Suit shape drawn as SVG, centered at (cx, cy), fitting in ~size × size box
function SuitShape({ suit, cx, cy, size }: { suit: Suit; cx: number; cy: number; size: number }) {
  const isRed = suit === 'ouros' || suit === 'copas'
  const fill = isRed ? '#dc2626' : '#1e293b'
  const s = size * 0.5

  if (suit === 'copas') {
    const r = s * 0.44
    return (
      <g fill={fill}>
        <circle cx={cx - r * 0.72} cy={cy - s * 0.08} r={r} />
        <circle cx={cx + r * 0.72} cy={cy - s * 0.08} r={r} />
        <polygon points={`${cx - s * 0.78},${cy + s * 0.08} ${cx},${cy + s * 0.82} ${cx + s * 0.78},${cy + s * 0.08}`} />
      </g>
    )
  }

  if (suit === 'ouros') {
    return (
      <polygon
        fill={fill}
        points={`${cx},${cy - s * 0.9} ${cx + s * 0.72},${cy} ${cx},${cy + s * 0.9} ${cx - s * 0.72},${cy}`}
      />
    )
  }

  if (suit === 'espadas') {
    const r = s * 0.38
    return (
      <g fill={fill}>
        <polygon points={`${cx - s * 0.78},${cy + s * 0.1} ${cx},${cy - s * 0.82} ${cx + s * 0.78},${cy + s * 0.1}`} />
        <circle cx={cx - r * 0.9} cy={cy + s * 0.12} r={r} />
        <circle cx={cx + r * 0.9} cy={cy + s * 0.12} r={r} />
        <rect x={cx - s * 0.1} y={cy + s * 0.4} width={s * 0.2} height={s * 0.38} />
        <rect x={cx - s * 0.36} y={cy + s * 0.72} width={s * 0.72} height={s * 0.16} rx={s * 0.06} />
      </g>
    )
  }

  // Paus (clubs)
  const r = s * 0.34
  return (
    <g fill={fill}>
      <circle cx={cx} cy={cy - s * 0.26} r={r} />
      <circle cx={cx - r * 1.2} cy={cy + s * 0.16} r={r} />
      <circle cx={cx + r * 1.2} cy={cy + s * 0.16} r={r} />
      <rect x={cx - s * 0.1} y={cy + s * 0.32} width={s * 0.2} height={s * 0.34} />
      <rect x={cx - s * 0.36} y={cy + s * 0.6} width={s * 0.72} height={s * 0.14} rx={s * 0.05} />
    </g>
  )
}

function PipLayout({ value, suit }: { value: CardValue; suit: Suit }) {
  const positions = PIP_POSITIONS[value]
  if (!positions) return null
  const isAce = value === 'A'
  const pipSize = isAce ? 62 : 26

  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      {positions.map(([px, py], i) => {
        const invert = py > 71
        return (
          <g key={i} transform={invert ? `rotate(180,${px},${py})` : undefined}>
            <SuitShape suit={suit} cx={px} cy={py} size={pipSize} />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Court card figures ────────────────────────────────────────────────────

function CourtKing({ suit }: { suit: Suit }) {
  const isRed = suit === 'ouros' || suit === 'copas'
  const main = isRed ? '#dc2626' : '#1a1a2e'
  const dark = isRed ? '#991b1b' : '#0d0d1a'
  const gold = '#d97706'
  const skin = '#fcd9a0'
  const sym = SUIT_SYMBOL[suit]

  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect x="5" y="5" width="90" height="130" rx="4" fill={isRed ? '#fff5f5' : '#f8fafc'} />
      <rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke={main} strokeWidth="2" opacity="0.5" />

      {/* Crown */}
      <polygon points="26,44 34,24 50,38 66,24 74,44 70,48 30,48" fill={gold} />
      <rect x="26" y="46" width="48" height="8" rx="1" fill={gold} />
      <circle cx="34" cy="24" r="4" fill={isRed ? '#ef4444' : '#6366f1'} />
      <circle cx="50" cy="36" r="4" fill={isRed ? '#ef4444' : '#6366f1'} />
      <circle cx="66" cy="24" r="4" fill={isRed ? '#ef4444' : '#6366f1'} />
      <circle cx="34" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="50" cy="36" r="1.5" fill="white" opacity="0.6" />
      <circle cx="66" cy="24" r="1.5" fill="white" opacity="0.6" />

      {/* Face */}
      <ellipse cx="50" cy="66" rx="16" ry="14" fill={skin} />
      <ellipse cx="44" cy="62" rx="2.5" ry="2" fill={main} />
      <ellipse cx="56" cy="62" rx="2.5" ry="2" fill={main} />
      <ellipse cx="44.5" cy="61.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      <ellipse cx="56.5" cy="61.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      <path d="M43,72 Q50,76 57,72" fill="none" stroke={main} strokeWidth="1.5" strokeLinecap="round" />
      {/* Mustache */}
      <path d="M43,68 Q46,66 50,68 Q54,66 57,68" fill="none" stroke={isRed ? '#991b1b' : '#475569'} strokeWidth="1.5" />
      {/* Beard */}
      <path d="M38,70 Q50,82 62,70 Q60,78 50,80 Q40,78 38,70 Z" fill={isRed ? '#fca5a5' : '#64748b'} opacity="0.5" />

      {/* Shoulders / body */}
      <rect x="24" y="80" width="52" height="52" rx="6" fill={main} />
      <rect x="43" y="80" width="14" height="52" fill={dark} />
      {/* Collar */}
      <path d="M32,80 Q50,92 68,80 L64,88 Q50,96 36,88 Z" fill="white" />
      {/* Belt */}
      <rect x="24" y="107" width="52" height="7" rx="1" fill={gold} />
      <rect x="45" y="105" width="10" height="11" rx="1.5" fill={gold} />
      <circle cx="50" cy="111" r="2" fill={dark} />

      {/* Left arm + sword */}
      <rect x="6" y="83" width="18" height="10" rx="4" fill={main} />
      <rect x="13" y="44" width="4" height="48" rx="2" fill="#e2e8f0" />
      <polygon points="15,40 13,44 17,44" fill="#94a3b8" />
      <rect x="7" y="59" width="20" height="4.5" rx="2" fill={gold} />

      {/* Right arm + orb */}
      <rect x="76" y="83" width="18" height="10" rx="4" fill={main} />
      <circle cx="88" cy="74" r="10" fill={gold} />
      <circle cx="88" cy="74" r="6" fill={main} opacity="0.25" />
      <circle cx="88" cy="74" r="2.5" fill={gold} />
      <rect x="86.5" y="64" width="3" height="8" fill={gold} />
      <rect x="82" y="64" width="12" height="3" rx="1.5" fill={gold} />

      <text x="50" y="135" textAnchor="middle" fontSize="10" fill={main} opacity="0.25">{sym}</text>
    </svg>
  )
}

function CourtQueen({ suit }: { suit: Suit }) {
  const isRed = suit === 'ouros' || suit === 'copas'
  const main = isRed ? '#dc2626' : '#1a1a2e'
  const dark = isRed ? '#991b1b' : '#0d0d1a'
  const gold = '#d97706'
  const skin = '#fcd9a0'
  const sym = SUIT_SYMBOL[suit]
  const accent = isRed ? '#fca5a5' : '#94a3b8'

  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect x="5" y="5" width="90" height="130" rx="4" fill={isRed ? '#fff5f5' : '#f8fafc'} />
      <rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke={main} strokeWidth="2" opacity="0.5" />

      {/* Crown */}
      <path d="M28,42 L36,22 L44,34 L50,16 L56,34 L64,22 L72,42 Z" fill={gold} />
      <rect x="28" y="42" width="44" height="7" rx="1" fill={gold} />
      <circle cx="50" cy="14" r="4.5" fill={isRed ? '#ef4444' : '#6366f1'} />
      <circle cx="36" cy="22" r="3" fill={isRed ? '#f87171' : '#818cf8'} />
      <circle cx="64" cy="22" r="3" fill={isRed ? '#f87171' : '#818cf8'} />
      <circle cx="50" cy="14" r="1.5" fill="white" opacity="0.6" />

      {/* Hair */}
      <ellipse cx="31" cy="75" rx="10" ry="26" fill={accent} opacity="0.65" />
      <ellipse cx="69" cy="75" rx="10" ry="26" fill={accent} opacity="0.65" />

      {/* Face */}
      <ellipse cx="50" cy="62" rx="15" ry="14" fill={skin} />
      <ellipse cx="44" cy="58" rx="2.5" ry="2" fill={main} />
      <ellipse cx="56" cy="58" rx="2.5" ry="2" fill={main} />
      <ellipse cx="44.5" cy="57.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      <ellipse cx="56.5" cy="57.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      {/* Lips */}
      <path d="M44,68 Q50,73 56,68" fill="none" stroke={isRed ? '#dc2626' : main} strokeWidth="2" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="42" cy="65" rx="4" ry="2.5" fill="#fca5a5" opacity="0.3" />
      <ellipse cx="58" cy="65" rx="4" ry="2.5" fill="#fca5a5" opacity="0.3" />

      {/* Dress */}
      <path d="M26,76 L16,132 L84,132 L74,76 Q50,88 26,76 Z" fill={main} />
      <path d="M40,76 L32,132 L68,132 L60,76 Q50,84 40,76 Z" fill={dark} />
      {/* Collar */}
      <path d="M34,76 Q50,86 66,76 L62,84 Q50,92 38,84 Z" fill="white" />
      {/* Waist detail */}
      <ellipse cx="50" cy="98" rx="16" ry="4" fill="none" stroke={gold} strokeWidth="1.5" />

      {/* Left arm + flower */}
      <rect x="8" y="79" width="18" height="9" rx="4" fill={main} />
      {/* Flower */}
      <circle cx="13" cy="70" r="8" fill={isRed ? '#fca5a5' : '#818cf8'} />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const rad = a * Math.PI / 180
        const px = 13 + Math.cos(rad) * 7
        const py = 70 + Math.sin(rad) * 7
        return <circle key={a} cx={px} cy={py} r="3.5" fill={isRed ? '#f87171' : '#6366f1'} opacity="0.7" />
      })}
      <circle cx="13" cy="70" r="3" fill={gold} />

      {/* Right arm + fan */}
      <rect x="74" y="79" width="18" height="9" rx="4" fill={main} />
      {[0, 20, 40, 60].map((a, i) => (
        <line key={i} x1="82" y1="72"
          x2={82 + Math.cos((a - 30) * Math.PI / 180) * 14}
          y2={72 - Math.sin((a - 30) * Math.PI / 180) * 14}
          stroke={gold} strokeWidth="1.5" />
      ))}
      <path d="M70,61 Q82,53 92,62 Q90,67 82,72 Q74,67 70,61 Z" fill={isRed ? '#fca5a5' : '#cbd5e1'} opacity="0.6" stroke={gold} strokeWidth="0.5" />

      <text x="50" y="135" textAnchor="middle" fontSize="10" fill={main} opacity="0.25">{sym}</text>
    </svg>
  )
}

function CourtJack({ suit }: { suit: Suit }) {
  const isRed = suit === 'ouros' || suit === 'copas'
  const main = isRed ? '#dc2626' : '#1a1a2e'
  const dark = isRed ? '#991b1b' : '#0d0d1a'
  const gold = '#d97706'
  const skin = '#fcd9a0'
  const sym = SUIT_SYMBOL[suit]

  return (
    <svg viewBox="0 0 100 140" className="w-full h-full">
      <rect x="5" y="5" width="90" height="130" rx="4" fill={isRed ? '#fff5f5' : '#f8fafc'} />
      <rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke={main} strokeWidth="2" opacity="0.5" />

      {/* Hat */}
      <ellipse cx="50" cy="30" rx="24" ry="11" fill={main} />
      <rect x="26" y="22" width="48" height="12" rx="3" fill={main} />
      <path d="M26,34 Q50,41 74,34" fill={dark} />
      <rect x="26" y="33" width="48" height="3.5" fill={gold} />
      {/* Feather */}
      <path d="M70,22 Q88,8 80,26 Q86,14 70,22" fill={isRed ? '#fca5a5' : '#94a3b8'} />
      <path d="M73,20 Q88,10 82,26" fill={isRed ? '#fee2e2' : '#cbd5e1'} opacity="0.5" />

      {/* Face */}
      <ellipse cx="50" cy="52" rx="16" ry="14" fill={skin} />
      <ellipse cx="44" cy="48" rx="2.5" ry="2" fill={main} />
      <ellipse cx="56" cy="48" rx="2.5" ry="2" fill={main} />
      <ellipse cx="44.5" cy="47.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      <ellipse cx="56.5" cy="47.5" rx="1" ry="0.5" fill="white" opacity="0.7" />
      <path d="M44,57 Q50,61 56,57" fill="none" stroke={main} strokeWidth="1.5" strokeLinecap="round" />
      {/* Short beard */}
      <path d="M38,58 Q50,68 62,58 Q60,64 50,66 Q40,64 38,58 Z" fill={isRed ? '#fca5a5' : '#64748b'} opacity="0.45" />

      {/* Body */}
      <rect x="26" y="66" width="48" height="58" rx="5" fill={main} />
      <rect x="43" y="66" width="14" height="58" fill={dark} />
      {/* Collar */}
      <path d="M32,66 Q50,78 68,66 L64,74 Q50,82 36,74 Z" fill="white" />
      {/* Belt */}
      <rect x="26" y="94" width="48" height="6" rx="1" fill={gold} />
      <rect x="45" y="92" width="10" height="10" rx="1.5" fill={gold} />

      {/* Left arm + shield */}
      <rect x="8" y="68" width="18" height="10" rx="4" fill={main} />
      <path d="M6,54 L20,50 L20,80 Q6,76 6,54 Z" fill={isRed ? '#fca5a5' : '#475569'} />
      <line x1="7" y1="56" x2="19" y2="52" stroke={gold} strokeWidth="1.5" />
      <line x1="13" y1="53" x2="13" y2="77" stroke={gold} strokeWidth="1.5" />
      <path d="M6,74 Q13,80 20,74" fill="none" stroke={gold} strokeWidth="1.5" />

      {/* Right arm + sword */}
      <rect x="74" y="68" width="18" height="10" rx="4" fill={main} />
      <rect x="85" y="30" width="4" height="48" rx="2" fill="#e2e8f0" />
      <polygon points="87,26 85,30 89,30" fill="#94a3b8" />
      <rect x="78" y="46" width="20" height="4.5" rx="2" fill={gold} />
      <rect x="84" y="76" width="6" height="10" rx="2.5" fill={dark} />

      <text x="50" y="135" textAnchor="middle" fontSize="10" fill={main} opacity="0.25">{sym}</text>
    </svg>
  )
}

function CourtFigure({ value, suit }: { value: CardValue; suit: Suit }) {
  if (value === 'K') return <CourtKing suit={suit} />
  if (value === 'Q') return <CourtQueen suit={suit} />
  return <CourtJack suit={suit} />
}

export function CardComponent({ code, onClick, selected, disabled, size = 'md', faceDown, className }: CardProps) {
  const s = sizes[size]

  if (faceDown) {
    return (
      <div className={cn(
        s.card,
        'rounded-lg overflow-hidden card-shadow select-none flex-shrink-0 border-2 border-gray-300',
        className,
      )}>
        <div className="w-full h-full bg-gradient-to-br from-red-700 via-red-800 to-red-900 relative">
          <div className="absolute inset-[3px] border border-red-400/40 rounded-sm" />
          <div className="absolute inset-[6px] border border-red-300/20 rounded-sm" />
          <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 24 34">
            {Array.from({ length: 6 }).flatMap((_, r) =>
              Array.from({ length: 4 }).map((_, c) => (
                <polygon key={`${r}-${c}`}
                  points={`${c * 6 + 3},${r * 6 + 1} ${c * 6 + 5},${r * 6 + 3} ${c * 6 + 3},${r * 6 + 5} ${c * 6 + 1},${r * 6 + 3}`}
                  fill="white" />
              ))
            )}
          </svg>
        </div>
      </div>
    )
  }

  const card = parseCard(code)
  const isCourt = COURT_VALUES.includes(card.value)
  const isRed = card.suit === 'ouros' || card.suit === 'copas'
  const textColor = isRed ? 'text-red-600' : 'text-slate-900'

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        s.card,
        'relative rounded-lg bg-white border-2 card-shadow',
        'flex flex-col select-none overflow-hidden flex-shrink-0',
        'transition-all duration-150',
        onClick && !disabled && 'cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95',
        selected && '-translate-y-3 scale-105 border-yellow-400 ring-2 ring-yellow-300',
        !selected && 'border-gray-200',
        disabled && !selected && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      {/* Top-left corner */}
      <div className={cn('flex flex-col items-center leading-none flex-shrink-0', s.pad, textColor)}>
        <span className={cn('font-black', s.label)}>{CARD_LABEL[card.value]}</span>
        <span className={cn('leading-none', s.sym)}>{SUIT_SYMBOL[card.suit]}</span>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
        {isCourt ? (
          <CourtFigure value={card.value} suit={card.suit} />
        ) : (
          <PipLayout value={card.value} suit={card.suit} />
        )}
      </div>

      {/* Bottom-right corner (rotated 180°) */}
      <div className={cn('flex flex-col items-center leading-none rotate-180 flex-shrink-0 self-end', s.pad, textColor)}>
        <span className={cn('font-black', s.label)}>{CARD_LABEL[card.value]}</span>
        <span className={cn('leading-none', s.sym)}>{SUIT_SYMBOL[card.suit]}</span>
      </div>
    </button>
  )
}
