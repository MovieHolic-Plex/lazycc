import { readFileSync } from "node:fs"
import test from "node:test"
import assert from "node:assert/strict"

const README = readFileSync("README.md", "utf8")

test("README presents LazyCC as the Codex and Cursor orchestration fork", () => {
  const requiredSnippets = [
    "LazyCC",
    "npx lazycc-ai install",
    "lazycc bridge start",
    "lazycc cursor ask",
    "cursor-ai-proxy-bridge",
    "Codex stays responsible for orchestration",
    "Cursor handles routine implementation",
  ]

  for (const snippet of requiredSnippets) {
    assert.match(README, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
})
