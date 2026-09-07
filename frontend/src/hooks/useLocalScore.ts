import { useCallback, useState } from 'react'

export interface Score {
  wins: number
  losses: number
  draws: number
}

const STORAGE_KEY = 'wingtictac.score'
const EMPTY: Score = { wins: 0, losses: 0, draws: 0 }

function read(): Score {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function useLocalScore() {
  const [score, setScore] = useState<Score>(read)

  const record = useCallback((outcome: 'win' | 'loss' | 'draw') => {
    setScore((prev) => {
      const next: Score = {
        wins: prev.wins + (outcome === 'win' ? 1 : 0),
        losses: prev.losses + (outcome === 'loss' ? 1 : 0),
        draws: prev.draws + (outcome === 'draw' ? 1 : 0),
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage unavailable (private browsing etc.) - score just won't persist
      }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setScore(EMPTY)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return { score, record, reset }
}
