import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"

const root = new URL("..", import.meta.url).pathname
const lazyccBin = join(root, "bin", "lazycc.js")
const vendoredBridgeRoot = join(root, "packages", "cursor-ai-proxy-bridge")
const pluginCursorRoot = join(root, "plugins", "omo", "components", "lazycc-cursor")

test("LazyCC vendors cursor-ai-proxy-bridge as a single project dependency", () => {
  assert.equal(existsSync(join(vendoredBridgeRoot, "package.json")), true)
  assert.equal(existsSync(join(vendoredBridgeRoot, "src", "server.ts")), true)

  const manifest = JSON.parse(readFileSync(join(vendoredBridgeRoot, "package.json"), "utf8"))
  assert.equal(manifest.name, "@lazycc/cursor-ai-proxy-bridge")
})

test("lazycc bridge start builds and runs the vendored bridge instead of cloning GitHub", () => {
  const result = spawnSync(
    process.execPath,
    [lazyccBin, "--dry-run", "bridge", "start", "--backend", "mock", "--api-key", "sk-test"],
    { cwd: root, encoding: "utf8" },
  )

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stdout, /git clone/)
  assert.match(result.stdout, new RegExp(`npm install --prefix ${escapeRegExp(vendoredBridgeRoot)}`))
  assert.match(result.stdout, new RegExp(`node ${escapeRegExp(join(vendoredBridgeRoot, "dist", "index.js"))}`))
})

test("LazyCC does not ship the redundant internal lazycc-cursor wrapper", () => {
  assert.equal(existsSync(pluginCursorRoot), false)

  const aggregateManifest = JSON.parse(readFileSync(join(root, "plugins", "omo", "package.json"), "utf8"))
  assert.equal(aggregateManifest.workspaces.includes("components/lazycc-cursor"), false)
})

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
