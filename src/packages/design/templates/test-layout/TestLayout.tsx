import { useState, type ReactNode } from 'react'
import { Card } from '@/packages/design/ui/card'

interface TestLayoutProps {
  logoUrl: string
  logoAlt: string
  subtitle: string
  progress?: ReactNode
  children: ReactNode
}

/** Logo with a simple text fallback when the image fails to load. */
function BrandLogo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="text-[22px] font-semibold text-sabbi-verde-noche">
        Sabbi
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="mx-auto h-[52px] w-auto"
      onError={() => setFailed(true)}
    />
  )
}

/**
 * Self-contained shell for the Test Perfil Sabbi: centered 660px column on the
 * hueso background, brand header, optional progress row and the white card.
 * Structure only — no page content lives here.
 */
export function TestLayout({
  logoUrl,
  logoAlt,
  subtitle,
  progress,
  children,
}: TestLayoutProps) {
  return (
    <div
      className="min-h-screen bg-sabbi-hueso text-sabbi-verde-prof"
      style={{ fontFamily: "'Pratico','Hanken Grotesk',system-ui,sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[660px] px-5 pt-8 pb-16">
        <header className="mb-7 text-center">
          <BrandLogo src={logoUrl} alt={logoAlt} />
          <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b7a5a]">
            {subtitle}
          </div>
        </header>

        {progress ? <div className="mb-6">{progress}</div> : null}

        <Card className="rounded-[24px] px-4 py-[22px] shadow-[0_1px_12px_rgba(51,79,27,0.07)] sm:px-8 sm:py-9">
          {children}
        </Card>
      </div>
    </div>
  )
}
