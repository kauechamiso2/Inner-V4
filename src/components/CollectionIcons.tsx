import type { ReactNode } from 'react'

/* Ícones estilo iOS (SF Symbols) para as coleções.
   Traço monoline, fill=none, cor via currentColor (herda a cor do container).
   No produto final, cor e ícone serão escolhidos pelo usuário na criação. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconClock = () => (
  <Glyph>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.3V12l3.1 1.9" />
  </Glyph>
)

export const IconFolder = () => (
  <Glyph>
    <path d="M3.6 7.7a2 2 0 0 1 2-2h2.9a2 2 0 0 1 1.2.4l1.5 1.1a2 2 0 0 0 1.2.4h4.1a2 2 0 0 1 2 2v6.7a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
  </Glyph>
)

export const IconSliders = () => (
  <Glyph>
    <path d="M4 8h8.2M15.8 8H20M4 16h4.2M11.8 16H20" />
    <circle cx="14" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </Glyph>
)

export const IconSun = () => (
  <Glyph>
    <circle cx="12" cy="12" r="3.9" />
    <path d="M12 2.7v2.1M12 19.2v2.1M21.3 12h-2.1M4.8 12H2.7M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9 5.4 5.4" />
  </Glyph>
)

export const IconCalendar = () => (
  <Glyph>
    <rect x="3.6" y="5" width="16.8" height="15" rx="3" />
    <path d="M3.6 9.4h16.8M8 3.4v3M16 3.4v3" />
  </Glyph>
)

export const IconPin = () => (
  <Glyph>
    <path d="M12 21.2c3.2-3.6 6-6.8 6-10.2a6 6 0 1 0-12 0c0 3.4 2.8 6.6 6 10.2Z" />
    <circle cx="12" cy="11" r="2.3" />
  </Glyph>
)

export const IconEnvelope = () => (
  <Glyph>
    <rect x="3.3" y="5.6" width="17.4" height="12.8" rx="3" />
    <path d="m4.6 7.8 6.2 4.5a2 2 0 0 0 2.4 0l6.2-4.5" />
  </Glyph>
)

export const IconBolt = () => (
  <Glyph>
    <path d="M13.4 2.8 6 13.2h4.6l-1 8 7.4-10.4h-4.6l1-8Z" />
  </Glyph>
)

export const IconColumns = () => (
  <Glyph>
    <path d="M3.7 9.4 12 3.9l8.3 5.5M5.5 9.7v7.9M9.8 9.7v7.9M14.2 9.7v7.9M18.5 9.7v7.9M3.5 20.3h17" />
  </Glyph>
)

export const IconGlobe = () => (
  <Glyph>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8M12 3.6c2.5 2.4 2.5 14.4 0 16.8M12 3.6c-2.5 2.4-2.5 14.4 0 16.8" />
  </Glyph>
)

export const IconPhoto = () => (
  <Glyph>
    <rect x="3.4" y="5" width="17.2" height="14" rx="3" />
    <circle cx="8.6" cy="10" r="1.5" />
    <path d="m3.9 17.6 4.4-4.1a2 2 0 0 1 2.7 0l5 4.6" />
  </Glyph>
)

export const IconEllipsis = () => (
  <Glyph>
    <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Glyph>
)

export const IconAirplane = () => (
  <Glyph>
    <path
      d="M11 2.6c.3-.7 1.7-.7 2 0 .2.4.3 1 .2 1.6l-.5 2.2 6.9 4.1c.3.2.5.5.5.9v1.1c0 .4-.4.7-.8.6l-6.5-1.9-.3 3.5 2.1 1.6c.2.2.3.4.3.7v.8c0 .3-.3.6-.7.5l-2.9-.9a1.2 1.2 0 0 0-.7 0l-2.9.9c-.4.1-.7-.2-.7-.5v-.8c0-.3.1-.5.3-.7l2.1-1.6-.3-3.5L3.4 13c-.4.1-.8-.2-.8-.6v-1.1c0-.4.2-.7.5-.9l6.9-4.1-.5-2.2c-.1-.6 0-1.2.2-1.6Z"
      fill="currentColor"
      stroke="none"
    />
  </Glyph>
)

export const IconChartBar = () => (
  <Glyph>
    <rect x="3.8" y="11.5" width="3.5" height="7.7" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="10.2" y="6" width="3.5" height="13.2" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="16.6" y="8.8" width="3.5" height="10.4" rx="1.2" fill="currentColor" stroke="none" />
  </Glyph>
)

export const IconTag = () => (
  <Glyph>
    <path d="M4 4.6h6.1c.5 0 1 .2 1.4.6l7 7a2 2 0 0 1 0 2.8l-5.1 5.1a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4V5.6c0-.6.4-1 1-1Z" />
    <circle cx="8" cy="8.6" r="1.4" />
  </Glyph>
)
