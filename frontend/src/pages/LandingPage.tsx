import { Link } from 'react-router-dom'
import { TicTacToeGame } from '../components/game/TicTacToeGame'

const COMING_SOON = [
  { name: 'Connect Four', glyph: '●' },
  { name: 'Memory Match', glyph: '▦' },
  { name: 'Rock · Paper · Scissors', glyph: '✊' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="safe-top sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <Link
            to="/login"
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-dim transition-colors hover:border-primary/50 hover:text-text"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="order-2 flex flex-col items-center lg:order-1 lg:items-start">
            <span className="mb-3 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary-2 uppercase">
              Free to play
            </span>
            <h1 className="font-display max-w-md text-center text-4xl leading-tight font-bold sm:text-5xl lg:text-left">
              Classic Tic-Tac-Toe,
              <span className="bg-gradient-to-r from-primary to-primary-2 bg-clip-text text-transparent"> reimagined</span>
            </h1>
            <p className="mt-4 max-w-sm text-center text-text-dim lg:text-left">
              Challenge the computer, sharpen your strategy, and climb your personal scoreboard — right in your
              browser, no download required.
            </p>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-glow sm:p-6">
              <TicTacToeGame />
            </div>
          </div>
        </section>

        <section className="border-t border-border py-10">
          <h2 className="font-display mb-1 text-lg font-semibold">More games, coming soon</h2>
          <p className="mb-5 text-sm text-text-dim">We're building out the arcade — check back soon.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COMING_SOON.map((g) => (
              <div
                key={g.name}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4 opacity-60"
              >
                <span className="font-display flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg">
                  {g.glyph}
                </span>
                <div>
                  <p className="text-sm font-medium">{g.name}</p>
                  <p className="text-xs text-text-faint">Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="safe-bottom border-t border-border py-6 text-center text-xs text-text-faint">
        © {new Date().getFullYear()} WingTicTac Arena · Have an account?{' '}
        <Link to="/login" className="text-text-dim underline underline-offset-2 hover:text-text">
          Sign in
        </Link>
      </footer>
    </div>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-2 text-sm font-bold text-white">
        #
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Wing<span className="text-primary-2">Tic</span><span className="text-accent-pink">Tac</span>
      </span>
    </div>
  )
}
