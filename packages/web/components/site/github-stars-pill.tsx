import type { JSX } from "react"
import { SITE_CONFIG } from "../../lib/site-config"
import { GITHUB_STARS } from "../../lib/github-stars.generated"

export function GithubStarsPill(): JSX.Element {
  return (
    <a
      href={SITE_CONFIG.githubStarsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-8 items-center gap-1.5 rounded-full border border-[#172323] bg-[#0E1313] px-3 text-sm font-medium text-[color:var(--accent-cyan)] transition-colors hover:border-[color:var(--accent-teal)] hover:bg-[#131a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-cyan)]"
      aria-label={`${GITHUB_STARS} stars on GitHub`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:scale-110"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>{GITHUB_STARS} stars</span>
    </a>
  )
}
