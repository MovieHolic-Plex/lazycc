import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { describe, it } from "node:test"

const root = new URL("..", import.meta.url).pathname
const packageJsonPath = join(root, "package.json")
const packageLockPath = join(root, "package-lock.json")
const publishWorkflowPath = join(root, ".github", "workflows", "npm-publish.yml")
const lazyccBinPath = join(root, "bin", "lazycc.js")
const legacyBinPath = join(root, "bin", "lazycodex-ai.js")
const releaseVersion = "0.1.0"

describe("lazycc-ai npm package", () => {
  it("maps the package name and bins to lazycc with a legacy lazycodex-ai alias", () => {
    // given
    assert.equal(existsSync(packageJsonPath), true, "root package.json must exist")

    // when
    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"))

    // then
    assert.equal(manifest.name, "lazycc-ai")
    assert.equal(manifest.version, releaseVersion)
    assert.equal(manifest.bin?.lazycc, "bin/lazycc.js")
    assert.equal(manifest.bin?.["lazycc-ai"], "bin/lazycc.js")
    assert.equal(manifest.bin?.["lazycodex-ai"], "bin/lazycodex-ai.js")
    assert.equal(manifest.private, undefined)
  })

  it("keeps publish metadata aligned with the release version", () => {
    // given
    assert.equal(existsSync(packageJsonPath), true, "root package.json must exist")
    assert.equal(existsSync(packageLockPath), true, "package-lock.json must exist")
    assert.equal(existsSync(publishWorkflowPath), true, "npm publish workflow must exist")

    // when
    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    const lockfile = JSON.parse(readFileSync(packageLockPath, "utf8"))
    const publishWorkflow = readFileSync(publishWorkflowPath, "utf8")

    // then
    assert.equal(manifest.version, releaseVersion)
    assert.equal(lockfile.version, releaseVersion)
    assert.equal(lockfile.packages?.[""]?.version, releaseVersion)
    assert.match(publishWorkflow, new RegExp(`default: "${releaseVersion}"`))
  })

  it("dry-runs install through oh-my-openagent with the Codex platform default", () => {
    // given
    assert.equal(existsSync(lazyccBinPath), true, "lazycc bin must exist")

    // when
    const result = spawnSync(
      process.execPath,
      [lazyccBinPath, "--dry-run", "install", "--no-tui", "--codex-autonomous"],
      { cwd: root, encoding: "utf8" },
    )

    // then
    assert.equal(result.status, 0, result.stderr)
    assert.equal(
      result.stdout.trim(),
      [
        "npx --yes --package oh-my-openagent omo install --platform=codex --no-tui --codex-autonomous",
        `cp -R ${join(root, "plugins", "omo", "lazycc-skills", "cursor-delegation")} ${join(process.env.HOME, ".codex", "skills", "cursor-delegation")}`,
        `cp -R ${join(root, "bin")} ${join(process.env.HOME, ".codex", "lazycc", "bin")}`,
        `cp -R ${join(root, "packages", "cursor-ai-proxy-bridge")} ${join(process.env.HOME, ".codex", "lazycc", "packages", "cursor-ai-proxy-bridge")}`,
      ].join("\n"),
    )
  })

  it("keeps the legacy lazycodex-ai bin as an oh-my-openagent compatibility alias", () => {
    // given
    assert.equal(existsSync(legacyBinPath), true, "lazycodex-ai bin must exist")

    // when
    const result = spawnSync(process.execPath, [legacyBinPath, "--dry-run", "doctor"], {
      cwd: root,
      encoding: "utf8",
    })

    // then
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout.trim(), "npx --yes --package oh-my-openagent omo doctor")
  })

  it("dry-runs bridge bootstrap with deterministic environment defaults", () => {
    // given
    assert.equal(existsSync(lazyccBinPath), true, "lazycc bin must exist")

    // when
    const result = spawnSync(
      process.execPath,
      [
        lazyccBinPath,
        "--dry-run",
        "bridge",
        "start",
        "--backend",
        "mock",
        "--api-key",
        "sk-test",
      ],
      { cwd: root, encoding: "utf8" },
    )

    // then
    assert.equal(result.status, 0, result.stderr)
    assert.equal(
      result.stdout.trim(),
      [
        `npm install --prefix ${join(root, "packages", "cursor-ai-proxy-bridge")}`,
        `npm run build --prefix ${join(root, "packages", "cursor-ai-proxy-bridge")}`,
        `CURSOR_BRIDGE_HOST=127.0.0.1 CURSOR_BRIDGE_PORT=9994 CURSOR_BRIDGE_BACKEND=mock CURSOR_BRIDGE_API_KEY=sk-test node ${join(root, "packages", "cursor-ai-proxy-bridge", "dist", "index.js")}`,
      ].join("\n"),
    )
  })

  it("dry-runs a cursor delegation request against the local bridge", () => {
    // given
    assert.equal(existsSync(lazyccBinPath), true, "lazycc bin must exist")

    // when
    const result = spawnSync(
      process.execPath,
      [lazyccBinPath, "--dry-run", "cursor", "ask", "--api-key", "sk-test", "--model", "composer-2.5", "write tests"],
      { cwd: root, encoding: "utf8" },
    )

    // then
    assert.equal(result.status, 0, result.stderr)
    assert.equal(
      result.stdout.trim(),
      "POST http://127.0.0.1:9994/v1/chat/completions model=composer-2.5 prompt=write tests",
    )
  })
})
