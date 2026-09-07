export type WallpaperTheme = 'arcade' | 'retro'

const THEME_COLORS: Record<WallpaperTheme, string> = {
  arcade: '9c8bff',
  retro: '5be0a8',
}

// Hand-drawn, original line-art of a die, a game controller, a star, a chess pawn and a
// playing card - deliberately not a reproduction of any existing chat app's wallpaper.
function buildTile(color: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <g fill="none" stroke="#${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55">
    <!-- die -->
    <g transform="translate(14,18) rotate(-8)">
      <rect x="0" y="0" width="34" height="34" rx="7" />
      <circle cx="9" cy="9" r="2.1" fill="#${color}" stroke="none" />
      <circle cx="25" cy="9" r="2.1" fill="#${color}" stroke="none" />
      <circle cx="17" cy="17" r="2.1" fill="#${color}" stroke="none" />
      <circle cx="9" cy="25" r="2.1" fill="#${color}" stroke="none" />
      <circle cx="25" cy="25" r="2.1" fill="#${color}" stroke="none" />
    </g>
    <!-- star -->
    <path transform="translate(150,20)" d="M12 0 L15 8.5 L24 8.8 L16.8 14.2 L19.4 23 L12 17.8 L4.6 23 L7.2 14.2 L0 8.8 L9 8.5 Z" />
    <!-- controller -->
    <g transform="translate(120,90)">
      <rect x="0" y="6" width="46" height="24" rx="12" />
      <line x1="12" y1="18" x2="12" y2="18" />
      <line x1="7" y1="18" x2="17" y2="18" />
      <line x1="12" y1="13" x2="12" y2="23" />
      <circle cx="34" cy="14" r="2.2" fill="#${color}" stroke="none" />
      <circle cx="39" cy="19" r="2.2" fill="#${color}" stroke="none" />
    </g>
    <!-- chess pawn -->
    <g transform="translate(30,120)">
      <circle cx="12" cy="6" r="6" />
      <path d="M6 16 C6 12 18 12 18 16 L21 30 L3 30 Z" />
      <line x1="1" y1="30" x2="23" y2="30" />
    </g>
    <!-- playing card -->
    <g transform="translate(160,150) rotate(10)">
      <rect x="0" y="0" width="28" height="38" rx="4" />
      <path d="M14 10 L17 16 L14 22 L11 16 Z" fill="#${color}" stroke="none" opacity="0.8" />
    </g>
    <!-- small dot cluster -->
    <circle cx="70" cy="60" r="1.6" fill="#${color}" stroke="none" />
    <circle cx="80" cy="66" r="1.6" fill="#${color}" stroke="none" />
    <circle cx="60" cy="70" r="1.6" fill="#${color}" stroke="none" />
  </g>
</svg>`.trim()
}

export function ChatWallpaper({ theme = 'arcade' }: { theme?: WallpaperTheme }) {
  const svg = buildTile(THEME_COLORS[theme])
  const dataUrl = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12]"
      style={{ backgroundImage: dataUrl, backgroundSize: '220px 220px', backgroundRepeat: 'repeat' }}
    />
  )
}
