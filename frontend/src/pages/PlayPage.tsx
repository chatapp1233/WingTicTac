import { TicTacToeGame } from '../components/game/TicTacToeGame'

export function PlayPage() {
  return (
    <div className="h-full overflow-y-auto px-4 py-8">
      <div className="mx-auto w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-glow sm:p-6">
        <TicTacToeGame />
      </div>
    </div>
  )
}
