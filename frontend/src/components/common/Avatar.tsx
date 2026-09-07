import { gradientFor, initialsFor } from '../../lib/avatar'

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
} as const

interface AvatarProps {
  name: string
  seed?: string
  size?: keyof typeof SIZES
  online?: boolean
  showStatus?: boolean
}

export function Avatar({ name, seed, size = 'md', online, showStatus }: AvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZES[size]} flex items-center justify-center rounded-full font-display font-semibold text-white shadow-inner`}
        style={{ background: gradientFor(seed ?? name) }}
      >
        {initialsFor(name)}
      </div>
      {showStatus && (
        <span
          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-bg ${
            online ? 'bg-accent-green' : 'bg-text-faint'
          }`}
        />
      )}
    </div>
  )
}
