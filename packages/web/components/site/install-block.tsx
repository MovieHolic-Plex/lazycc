import type { JSX } from "react"
import { SITE_CONFIG } from "../../lib/site-config"
import { CopyButton } from "./copy-button"

export function InstallBlock(): JSX.Element {
  return (
    <section className="mx-auto mt-12 flex w-full max-w-2xl flex-col items-center gap-4 px-4 md:mt-16">
      <div className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[color:var(--surface-panel)] p-2 pl-4 shadow-lg">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="select-none font-mono text-[color:var(--text-tertiary)]" aria-hidden="true">
            $
          </span>
          <code className="whitespace-nowrap font-mono text-sm font-medium text-[color:var(--text-primary)] md:text-base">
            {SITE_CONFIG.installCommand}
          </code>
        </div>
        <CopyButton value={SITE_CONFIG.installCommand} className="ml-4 shrink-0" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center text-sm text-[color:var(--text-muted)]">
        <p className="font-medium text-[color:var(--text-secondary)]">{SITE_CONFIG.status}</p>
        <p className="font-mono text-xs opacity-70">= {SITE_CONFIG.installEquivalent}</p>
      </div>
    </section>
  )
}
