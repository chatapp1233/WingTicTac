export type Cell = 'X' | 'O' | null
export type Board = Cell[]
export type Difficulty = 'easy' | 'hard'

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function calculateWinner(board: Board): { winner: Cell; line: number[] | null } {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  return { winner: null, line: null }
}

export function isDraw(board: Board): boolean {
  return board.every((c) => c !== null) && !calculateWinner(board).winner
}

export function emptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => (cell === null ? [...acc, i] : acc), [])
}

/** Minimax with alpha-beta pruning. Trivial search space (9 cells) so no depth limit needed. */
function minimax(board: Board, aiSymbol: Cell, humanSymbol: Cell, isMaximizing: boolean, alpha: number, beta: number, depth: number): number {
  const { winner } = calculateWinner(board)
  if (winner === aiSymbol) return 10 - depth
  if (winner === humanSymbol) return depth - 10
  if (isDraw(board)) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (const i of emptyCells(board)) {
      board[i] = aiSymbol
      best = Math.max(best, minimax(board, aiSymbol, humanSymbol, false, alpha, beta, depth + 1))
      board[i] = null
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const i of emptyCells(board)) {
      board[i] = humanSymbol
      best = Math.min(best, minimax(board, aiSymbol, humanSymbol, true, alpha, beta, depth + 1))
      board[i] = null
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

function bestMove(board: Board, aiSymbol: Cell, humanSymbol: Cell): number {
  let best = -Infinity
  let move = emptyCells(board)[0]
  for (const i of emptyCells(board)) {
    board[i] = aiSymbol
    const score = minimax(board, aiSymbol, humanSymbol, false, -Infinity, Infinity, 0)
    board[i] = null
    if (score > best) {
      best = score
      move = i
    }
  }
  return move
}

function randomMove(board: Board): number {
  const options = emptyCells(board)
  return options[Math.floor(Math.random() * options.length)]
}

export function getAiMove(board: Board, aiSymbol: Cell, humanSymbol: Cell, difficulty: Difficulty): number {
  if (difficulty === 'easy') {
    // Still block an immediate human win / take an immediate win 40% of the time so
    // "easy" feels beatable but not oblivious.
    if (Math.random() < 0.6) return randomMove(board)
    return bestMove([...board], aiSymbol, humanSymbol)
  }
  return bestMove([...board], aiSymbol, humanSymbol)
}
