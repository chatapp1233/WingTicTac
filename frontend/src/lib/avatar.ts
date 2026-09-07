const PALETTE = [
  ['#7c5cff', '#35e0ff'],
  ['#ff4fd8', '#7c5cff'],
  ['#35e0ff', '#37f2a0'],
  ['#ffb84f', '#ff4fd8'],
  ['#37f2a0', '#35e0ff'],
  ['#ff5470', '#ffb84f'],
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function gradientFor(seed: string): string {
  const [from, to] = PALETTE[hashString(seed) % PALETTE.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}
