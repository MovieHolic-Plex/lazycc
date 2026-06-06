import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const root = new URL("..", import.meta.url).pathname
const skillPath = join(root, "plugins", "omo", "skills", "cursor-delegation", "SKILL.md")

test("LazyCC ships a Cursor delegation skill for Codex", () => {
  assert.equal(existsSync(skillPath), true, "cursor-delegation skill must exist")

  const skill = readFileSync(skillPath, "utf8")
  const requiredSnippets = [
    "cursor-delegation",
    "lazycc bridge start",
    "lazycc cursor ask",
    "$HOME/.codex/lazycc",
    "Codex keeps orchestration",
    "Cursor handles routine implementation",
    "cursor-ai-proxy-bridge",
  ]

  for (const snippet of requiredSnippets) {
    assert.match(skill, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
})
