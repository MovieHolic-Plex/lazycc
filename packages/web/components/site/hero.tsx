import type { JSX } from "react"
import { SITE_CONFIG } from "../../lib/site-config"

export function Hero(): JSX.Element {
  return (
    <section className="relative isolate flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-[color:var(--card-base)] px-[20px] py-[60px] text-center shadow-[0_40px_120px_rgba(0,0,0,0.6)] md:px-[60px] md:py-[70px] lg:aspect-[1200/630]">
      {/* Card background — pure CSS gradient layers (the Codex-tone luminous
          card). Kept image-free so the hero text is the LCP element and paints
          at FCP: the path to a perfect Lighthouse performance score. The
          boulder identity lives in the favicon and the ultrawork orbit below. */}
      <div className="card-gradient-base absolute inset-0 -z-10" />
      <div className="card-gradient-pools absolute inset-0 -z-10" />
      <div className="card-gradient-sheen absolute -inset-[10%] -z-10" />
      <div className="card-gradient-beam absolute inset-0 -z-10" />
      <div className="card-grain absolute inset-0 -z-10" />

      {/* Card Content */}
      <div className="flex flex-col items-center justify-center gap-[30px]">
        <p className="font-mono text-[15px] font-medium uppercase tracking-[0.32em] text-[color:var(--text-soft)] opacity-90">
          {SITE_CONFIG.eyebrow}
        </p>

        <h1 className="m-0 text-balance text-[clamp(64px,12vw,168px)] font-medium leading-[0.98] tracking-[-0.03em] text-[color:var(--text-primary)]">
          {SITE_CONFIG.wordmark}
        </h1>

        <div className="m-0 max-w-[960px] text-balance text-[clamp(20px,3vw,34px)] font-normal leading-[1.35] tracking-[-0.005em] text-[color:var(--text-muted)]">
          <p>{SITE_CONFIG.heroLineA}</p>
          <p>
            {SITE_CONFIG.heroLineB.prefix}
            <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 font-mono text-[0.9em] text-[color:var(--text-soft)]">
              {SITE_CONFIG.heroLineB.slot}
            </span>
            {SITE_CONFIG.heroLineB.suffix}
            <strong className="font-medium text-[color:var(--accent-cyan)] drop-shadow-[0_0_8px_rgba(135,240,242,0.4)]">
              {SITE_CONFIG.heroLineB.keyword}
            </strong>
            {SITE_CONFIG.heroLineB.period}
          </p>
        </div>
      </div>
    </section>
  )
}
