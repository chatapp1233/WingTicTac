import { useEffect, useState } from 'react'

/**
 * Some hosting platforms inject their own fixed, very-high-z-index UI over the page (e.g.
 * Netlify's "Powered by Netlify" badge, `#nl-badge-frame`, bottom-right, z-index ~2^31) that
 * no z-index of ours can out-rank. Rather than hardcode a guess at its size (or silently hide
 * a host's own attribution badge), this measures it at runtime and returns how much bottom
 * clearance to reserve so our own fixed bottom UI (composer, bottom nav) doesn't render
 * underneath it. Returns 0 - a no-op - on any host that doesn't inject one.
 */
export function useBottomOverlayInset(): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    function measure() {
      const badge = document.getElementById('nl-badge-frame')
      setInset(badge ? Math.max(0, window.innerHeight - badge.getBoundingClientRect().top) : 0)
    }

    measure()
    // Third-party badge scripts typically load async and attach after our own mount.
    const observer = new MutationObserver(measure)
    observer.observe(document.body, { childList: true })
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return inset
}
