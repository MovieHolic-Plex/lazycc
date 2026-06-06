import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import test from "node:test"

test("npm package contains the LazyCC runtime without the website or node_modules", () => {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
    timeout: 120_000,
  })
  assert.equal(result.status, 0, result.stderr)
  const pack = JSON.parse(result.stdout)[0]
  const paths = pack.files.map((file) => file.path)

  assert(paths.includes("packages/cursor-ai-proxy-bridge/src/server.ts"))
  assert(paths.includes("plugins/omo/lazycc-skills/cursor-delegation/SKILL.md"))
  assert(!paths.some((path) => path.startsWith("packages/web/")))
  assert(!paths.some((path) => path.includes("node_modules/")))
  assert(!paths.some((path) => path.includes("/dist/")))
  assert(pack.size < 5_000_000, `package too large: ${pack.size}`)
})
