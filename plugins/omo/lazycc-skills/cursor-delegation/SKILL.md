---
name: cursor-delegation
description: Use when routine implementation, boilerplate generation, broad code writing, or repetitive edits can be delegated from Codex to Cursor through the LazyCC bridge.
metadata:
  short-description: Delegate routine implementation to Cursor CLI through LazyCC
---

# cursor-delegation

LazyCC uses Codex as the orchestrator and reviewer, while Cursor handles routine implementation through `cursor-ai-proxy-bridge`.

## Default Work Split

- Codex keeps orchestration, task decomposition, image generation, code review, verification design, adversarial QA, and final acceptance.
- Cursor handles routine implementation, boilerplate generation, repetitive edits, first-pass tests, migrations, and mechanical code writing.
- Codex must inspect Cursor output before treating it as correct. Cursor output is a draft, not evidence.

## Bridge Startup

Start the local Cursor bridge before delegating work. Inside Codex, prefer the
LazyCC overlay installed under `$HOME/.codex/lazycc`:

```bash
node "$HOME/.codex/lazycc/bin/lazycc.js" bridge start --backend cursor-cli --api-key "$CURSOR_BRIDGE_API_KEY"
```

From the development checkout, this equivalent command uses the same vendored
bridge source:

```bash
lazycc bridge start --backend cursor-cli --api-key "$CURSOR_BRIDGE_API_KEY"
```

For smoke tests without a Cursor login:

```bash
lazycc bridge start --backend mock --api-key sk-lazycc-local
```

The bridge is managed by LazyCC and is sourced from `cursor-ai-proxy-bridge`.
The source is vendored under `packages/cursor-ai-proxy-bridge`, so LazyCC does
not need to clone the bridge at runtime. It exposes an OpenAI-compatible
endpoint at `http://127.0.0.1:9994/v1`.

## Delegation Command

Send routine work to Cursor with:

```bash
node "$HOME/.codex/lazycc/bin/lazycc.js" cursor ask "TASK: implement the routine code change..."
lazycc cursor ask --api-key "$CURSOR_BRIDGE_API_KEY" --model composer-2.5 "<task>"
```

The task text must be self-contained:

```text
TASK: Implement the routine code change.
DELIVERABLE: Return changed files, tests added, and commands to verify.
SCOPE: Name exact files and directories.
VERIFY: Name exact commands and expected result.
CONSTRAINTS: Do not touch unrelated files. Do not claim completion without tests.
```

## Codex Review Contract

After Cursor returns work:

1. Codex reads the diff or generated patch.
2. Codex runs targeted tests and diagnostics.
3. Codex fixes or re-delegates routine failures.
4. Codex performs code review and acceptance.
5. Codex records the final evidence.

Keep high-risk decisions in Codex. Delegate execution, not judgment.
