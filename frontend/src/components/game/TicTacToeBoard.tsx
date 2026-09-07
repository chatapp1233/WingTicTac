import type { Board } from '../../lib/gameEngine'

interface Props {
  board: Board
  winningLine: number[] | null
  onCellClick: (index: number) => void
  disabled: boolean
}

function SymbolGlyph({ value }: { value: 'X' | 'O' }) {
  if (value === 'X') {
    return (
      <svg viewBox="0 0 40 40" className="h-[58%] w-[58%]">
        <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <line x1="32" y1="8" x2="8" y2="32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" className="h-[58%] w-[58%]">
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="5" />
    </svg>
  )
}

export function TicTacToeBoard({ board, winningLine, onCellClick, disabled }: Props) {
  return (
    <div className="grid aspect-square w-full max-w-sm grid-cols-3 gap-2.5 sm:gap-3">
      {board.map((cell, i) => {
        const isWinning = winningLine?.includes(i)
        return (
          <button
            key={i}
            type="button"
            disabled={disabled || cell !== null}
            onClick={() => onCellClick(i)}
            className={`flex aspect-square items-center justify-center rounded-2xl border-2 shadow-inner transition-colors duration-150 ${
              isWinning
                ? 'border-primary-2/70 bg-primary-2/15 text-primary-2 shadow-glow'
                : 'border-white/30 bg-white/10 text-text hover:enabled:border-white/45 hover:enabled:bg-white/[0.18]'
            } ${cell === null && !disabled ? 'cursor-pointer active:scale-95' : ''}`}
          >
            {cell && (
              <span className={`animate-pop-in ${cell === 'X' ? 'text-primary-2' : 'text-accent-pink'}`}>
                <SymbolGlyph value={cell} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
