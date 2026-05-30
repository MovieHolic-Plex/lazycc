import type { JSX } from "react"
import { SITE_CONFIG } from "../../lib/site-config"
import { BrandImage } from "./brand-image"

export function UltraworkSection(): JSX.Element {
  return (
    <section className="mx-auto mt-32 flex w-full max-w-[1200px] flex-col items-center px-4 text-center md:mt-40 md:px-8">
      <h2 className="text-balance text-[clamp(32px,5vw,48px)] font-medium tracking-tight text-[color:var(--text-primary)]">
        {SITE_CONFIG.ultraworkTagline}
      </h2>

      <div className="mt-8 rounded-lg border border-[color:var(--accent-cyan)]/20 bg-[color:var(--accent-cyan)]/5 px-6 py-3 shadow-[0_0_30px_rgba(135,240,242,0.1)]">
        <code className="font-mono text-lg font-medium text-[color:var(--accent-glow)]">
          {SITE_CONFIG.ultraworkExample}
        </code>
      </div>

      <div className="relative mt-16 w-full max-w-[960px]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(135,240,242,0.15)_0%,transparent_70%)] blur-3xl" />
        <BrandImage
          src="/img/ultrawork-orbit.png"
          alt="Diagram showing the ultrawork loop activating multiple agents"
          width={960}
          height={643}
          className="h-auto w-full"
        />
      </div>
    </section>
  )
}
