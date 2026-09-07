import { useEffect, useRef, useState } from 'react'
import { TicTacToeBoard } from './TicTacToeBoard'
import { useLocalScore } from '../../hooks/useLocalScore'
import { calculateWinner, emptyCells, getAiMove, isDraw, type Board, type Cell, type Difficulty } from '../../lib/gameEngine'

const EMPTY_BOARD: Board = Array(9).fill(null)

type Outcome = 'you' | 'computer' | 'draw' | null

export function TicTacToeGame() {
  const [playerSymbol, setPlayerSymbol] = useState<Cell>('X')
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [board, setBoard] = useState<Board>(EMPTY_BOARD)
  const [turn, setTurn] = useState<Cell>('X')
  const [thinking, setThinking] = useState(false)
  const { score, record, reset: resetScore } = useLocalScore()
  const recordedRef = useRef(false)

  const computerSymbol: Cell = playerSymbol === 'X' ? 'O' : 'X'
  const { winner, line } = calculateWinner(board)
  const draw = isDraw(board)
  const gameOver = winner !== null || draw
  const outcome: Outcome = winner ? (winner === playerSymbol ? 'you' : 'computer') : draw ? 'draw' : null

  function newGame(symbol: Cell = playerSymbol) {
    setPlayerSymbol(symbol)
    setBoard(EMPTY_BOARD)
    setTurn('X')
    recordedRef.current = false
  }

  useEffect(() => {
    if (gameOver && !recordedRef.current) {
      recordedRef.current = true
      record(outcome === 'you' ? 'win' : outcome === 'computer' ? 'loss' : 'draw')
    }
  }, [gameOver, outcome, record])

  useEffect(() => {
    if (gameOver || turn !== computerSymbol) return
    setThinking(true)
    const t = setTimeout(() => {
      const move = getAiMove(board, computerSymbol, playerSymbol, difficulty)
      if (move !== undefined && emptyCells(board).includes(move)) {
        const next = [...board]
        next[move] = computerSymbol
        setBoard(next)
        setTurn(playerSymbol)
      }
      setThinking(false)
    }, 450)
    return () => clearTimeout(t)
    // `computerSymbol` (derived from playerSymbol) must be a dependency: newGame() always
    // resets turn to 'X', so if turn was already 'X' (e.g. picking O right after mount),
    // turn itself doesn't change value and this effect would otherwise never re-run to
    // notice it's now the computer's move.
  }, [turn, gameOver, computerSymbol, playerSymbol, board, difficulty])

  function handleCellClick(index: number) {
    if (gameOver || board[index] || turn !== playerSymbol || thinking) return
    const next = [...board]
    next[index] = playerSymbol
    setBoard(next)
    setTurn(computerSymbol)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-sm items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
        <ScorePill label="You" value={score.wins} color="text-accent-green" />
        <ScorePill label="Draws" value={score.draws} color="text-text-dim" />
        <ScorePill label="CPU" value={score.losses} color="text-accent-pink" />
      </div>

      <div className="relative w-full max-w-sm">
        <TicTacToeBoard board={board} winningLine={line} onCellClick={handleCellClick} disabled={gameOver || turn !== playerSymbol} />
        {gameOver && (
          <div className="absolute inset-0 flex animate-rise-in items-center justify-center rounded-2xl bg-bg/70 backdrop-blur-sm">
            <div className="text-center">
              <p className={`font-display text-2xl font-bold ${outcome === 'you' ? 'text-accent-green' : outcome === 'computer' ? 'text-accent-pink' : 'text-text-dim'}`}>
                {outcome === 'you' ? 'You win! 🎉' : outcome === 'computer' ? 'Computer wins' : "It's a draw"}
              </p>
              <button
                onClick={() => newGame()}
                className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform active:scale-95"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="h-5 text-sm text-text-dim">
        {!gameOver && (turn === playerSymbol ? 'Your move' : thinking ? 'Computer is thinking…' : 'Computer move')}
      </p>

      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-text-dim uppercase">Play as</span>
          <div className="flex gap-1.5">
            {(['X', 'O'] as const).map((s) => (
              <button
                key={s}
                onClick={() => newGame(s)}
                className={`h-8 w-8 rounded-lg text-sm font-bold transition-colors ${
                  playerSymbol === s ? 'bg-primary text-white' : 'bg-surface-2 text-text-dim hover:text-text'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-text-dim uppercase">Difficulty</span>
          <div className="flex gap-1.5">
            {(['easy', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d)
                  newGame()
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  difficulty === d ? 'bg-primary text-white' : 'bg-surface-2 text-text-dim hover:text-text'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => newGame()}
            className="flex-1 rounded-xl border border-border bg-surface-2 py-2 text-sm font-semibold text-text transition-colors hover:bg-white/10"
          >
            New game
          </button>
          <button
            onClick={resetScore}
            className="rounded-xl border border-border px-3 py-2 text-sm text-text-dim transition-colors hover:text-text"
          >
            Reset score
          </button>
        </div>
      </div>
    </div>
  )
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] tracking-wide text-text-faint uppercase">{label}</div>
    </div>
  )
}
