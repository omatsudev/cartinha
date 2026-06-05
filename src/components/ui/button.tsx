import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm',
  secondary: 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20',
  ghost: 'hover:bg-white/10 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}
const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
