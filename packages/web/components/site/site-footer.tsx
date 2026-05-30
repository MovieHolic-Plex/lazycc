import type { JSX } from "react"
import { SITE_CONFIG } from "../../lib/site-config"

export function SiteFooter(): JSX.Element {
  return (
    <footer className="w-full border-t border-white/5 bg-[color:var(--surface-base)] py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 text-sm text-[color:var(--text-tertiary)] md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-[color:var(--text-secondary)]">
            lazycodex.ai
          </span>
          <span aria-hidden="true">·</span>
          <span>MIT License</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-cyan)]"
          >
            GitHub
          </a>
          <a
            href={SITE_CONFIG.sisyphusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-cyan)]"
          >
            by Sisyphus Labs
          </a>
        </div>
      </div>
    </footer>
  )
}
