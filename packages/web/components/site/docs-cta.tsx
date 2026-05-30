import type { JSX } from "react"
import Link from "next/link"
import { SITE_CONFIG } from "../../lib/site-config"

export function DocsCta(): JSX.Element {
  return (
    <section className="mx-auto mt-32 mb-24 flex w-full max-w-[800px] flex-col items-center rounded-2xl border border-white/10 bg-[color:var(--surface-panel)] px-6 py-16 text-center md:mt-40 md:px-12">
      <h2 className="text-3xl font-medium tracking-tight text-[color:var(--text-primary)]">
        Ready to stop thinking?
      </h2>
      <p className="mt-4 text-lg text-[color:var(--text-muted)]">
        Read the manual. It's short.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href={SITE_CONFIG.docsPath}
          className="rounded-md bg-[color:var(--text-primary)] px-6 py-3 font-medium text-[color:var(--surface-base)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-panel)]"
        >
          Read the Docs
        </Link>
        <Link
          href={`${SITE_CONFIG.docsPath}#ulw-loop`}
          className="rounded-md border border-white/20 bg-transparent px-6 py-3 font-medium text-[color:var(--text-primary)] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-panel)]"
        >
          How Ultrawork works
        </Link>
      </div>
    </section>
  )
}
