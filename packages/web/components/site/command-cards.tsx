import type { JSX } from "react"
import { COMMANDS } from "../../lib/commands"
import { CommandCard } from "./command-card"

export function CommandCards(): JSX.Element {
  return (
    <section className="mx-auto mt-24 w-full max-w-[1200px] px-4 md:mt-32 md:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COMMANDS.map((command) => (
          <CommandCard key={command.name} command={command} />
        ))}
      </div>
    </section>
  )
}
