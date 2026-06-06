#!/usr/bin/env node

import { existsSync } from "node:fs"
import { cp, mkdir, rm } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const DEFAULT_BRIDGE_HOST = "127.0.0.1"
const DEFAULT_BRIDGE_PORT = "9994"
const DEFAULT_BRIDGE_MODEL = "composer-2.5"
const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const VENDORED_BRIDGE_DIR = join(packageRoot, "packages", "cursor-ai-proxy-bridge")

const rawArgs = process.argv.slice(2)
const dryRun = rawArgs[0] === "--dry-run"
const args = dryRun ? rawArgs.slice(1) : rawArgs
const command = args[0]

if (command === "install") {
  await runOmoInstall(args.slice(1))
} else if (command === "bridge") {
  await runBridge(args.slice(1))
} else if (command === "cursor") {
  await runCursor(args.slice(1))
} else if (command === "help" || command === "--help" || command === "-h" || command === undefined) {
  printHelp()
} else {
  runOmoCommand(args)
}

async function runOmoInstall(forwardedArgs) {
  runCommand("npx", [
    "--yes",
    "--package",
    "oh-my-openagent",
    "omo",
    "install",
    "--platform=codex",
    ...forwardedArgs,
  ])
  await installLazyccSkills()
}

function runOmoCommand(forwardedArgs) {
  runCommand("npx", ["--yes", "--package", "oh-my-openagent", "omo", ...forwardedArgs])
}

async function installLazyccSkills() {
  const skillSource = join(packageRoot, "plugins", "omo", "lazycc-skills", "cursor-delegation")
  const skillTarget = join(homedir(), ".codex", "skills", "cursor-delegation")
  const overlayRoot = join(homedir(), ".codex", "lazycc")
  if (dryRun) {
    process.stdout.write(`cp -R ${skillSource} ${skillTarget}\n`)
    process.stdout.write(`cp -R ${join(packageRoot, "bin")} ${join(overlayRoot, "bin")}\n`)
    process.stdout.write(`cp -R ${VENDORED_BRIDGE_DIR} ${join(overlayRoot, "packages", "cursor-ai-proxy-bridge")}\n`)
    return
  }
  await mkdir(dirname(skillTarget), { recursive: true })
  await rm(skillTarget, { recursive: true, force: true })
  await cp(skillSource, skillTarget, { recursive: true })

  await mkdir(join(overlayRoot, "packages"), { recursive: true })
  await rm(join(overlayRoot, "bin"), { recursive: true, force: true })
  await rm(join(overlayRoot, "packages", "cursor-ai-proxy-bridge"), { recursive: true, force: true })
  await cp(join(packageRoot, "bin"), join(overlayRoot, "bin"), { recursive: true })
  await cp(VENDORED_BRIDGE_DIR, join(overlayRoot, "packages", "cursor-ai-proxy-bridge"), {
    recursive: true,
    filter: (source) => !source.includes(`${join("node_modules")}`) && !source.includes(`${join("dist")}`),
  })
}

async function runBridge(argv) {
  const subcommand = argv[0]
  const rest = argv.slice(1)
  if (subcommand === "start") {
    await startBridge(rest)
    return
  }
  if (subcommand === "doctor") {
    doctorBridge(rest)
    return
  }
  bridgeHelp()
  process.exitCode = subcommand === "help" || subcommand === undefined ? 0 : 1
}

async function startBridge(argv) {
  const bridgeDir = readValue(argv, "--bridge-dir") ?? process.env.LAZYCC_CURSOR_BRIDGE_DIR ?? VENDORED_BRIDGE_DIR
  const backend = readValue(argv, "--backend") ?? process.env.CURSOR_BRIDGE_BACKEND ?? "cursor-cli"
  const apiKey = readValue(argv, "--api-key") ?? process.env.CURSOR_BRIDGE_API_KEY ?? "sk-lazycc-local"
  const host = readValue(argv, "--host") ?? process.env.CURSOR_BRIDGE_HOST ?? DEFAULT_BRIDGE_HOST
  const port = readValue(argv, "--port") ?? process.env.CURSOR_BRIDGE_PORT ?? DEFAULT_BRIDGE_PORT
  const cursorBin = readValue(argv, "--cursor-bin") ?? process.env.CURSOR_BRIDGE_CURSOR_BIN
  const model = readValue(argv, "--model") ?? process.env.CURSOR_BRIDGE_DEFAULT_MODEL
  const plan = bridgeBootstrapPlan(bridgeDir)
  const envLine = formatEnv({
    CURSOR_BRIDGE_HOST: host,
    CURSOR_BRIDGE_PORT: port,
    CURSOR_BRIDGE_BACKEND: backend,
    CURSOR_BRIDGE_API_KEY: apiKey,
    ...(cursorBin === undefined ? {} : { CURSOR_BRIDGE_CURSOR_BIN: cursorBin }),
    ...(model === undefined ? {} : { CURSOR_BRIDGE_DEFAULT_MODEL: model }),
  })
  const startLine = `${envLine} node ${join(bridgeDir, "dist", "index.js")}`

  if (dryRun) {
    process.stdout.write([...plan.map((step) => step.printable), startLine].join("\n"))
    process.stdout.write("\n")
    return
  }

  await mkdir(dirname(bridgeDir), { recursive: true })
  for (const step of plan) runCommand(step.command, step.args, step.cwd)
  runCommand("node", [join(bridgeDir, "dist", "index.js")], undefined, {
    CURSOR_BRIDGE_HOST: host,
    CURSOR_BRIDGE_PORT: port,
    CURSOR_BRIDGE_BACKEND: backend,
    CURSOR_BRIDGE_API_KEY: apiKey,
    ...(cursorBin === undefined ? {} : { CURSOR_BRIDGE_CURSOR_BIN: cursorBin }),
    ...(model === undefined ? {} : { CURSOR_BRIDGE_DEFAULT_MODEL: model }),
  })
}

function bridgeBootstrapPlan(bridgeDir) {
  if (!existsSync(join(bridgeDir, "package.json"))) {
    throw new Error(`Cursor bridge package not found: ${bridgeDir}`)
  }
  const steps = []
  steps.push({
    command: "npm",
    args: ["install", "--prefix", bridgeDir],
    printable: `npm install --prefix ${bridgeDir}`,
  })
  steps.push({
    command: "npm",
    args: ["run", "build", "--prefix", bridgeDir],
    printable: `npm run build --prefix ${bridgeDir}`,
  })
  return steps
}

function doctorBridge(argv) {
  const bridgeDir = readValue(argv, "--bridge-dir") ?? process.env.LAZYCC_CURSOR_BRIDGE_DIR ?? VENDORED_BRIDGE_DIR
  const checks = [
    `bridge_dir=${bridgeDir}`,
    "bridge_source=vendored",
    `package_json=${existsSync(join(bridgeDir, "package.json")) ? "present" : "missing"}`,
    `dist_index=${existsSync(join(bridgeDir, "dist", "index.js")) ? "present" : "missing"}`,
    `api_base=http://${process.env.CURSOR_BRIDGE_HOST ?? DEFAULT_BRIDGE_HOST}:${process.env.CURSOR_BRIDGE_PORT ?? DEFAULT_BRIDGE_PORT}/v1`,
  ]
  process.stdout.write(`${checks.join("\n")}\n`)
}

async function runCursor(argv) {
  const subcommand = argv[0]
  const rest = argv.slice(1)
  if (subcommand !== "ask") {
    cursorHelp()
    process.exitCode = subcommand === "help" || subcommand === undefined ? 0 : 1
    return
  }

  const apiKey = readValue(rest, "--api-key") ?? process.env.CURSOR_BRIDGE_API_KEY
  const model = readValue(rest, "--model") ?? process.env.LAZYCC_CURSOR_MODEL ?? DEFAULT_BRIDGE_MODEL
  const baseUrl = readValue(rest, "--base-url") ?? process.env.LAZYCC_CURSOR_BASE_URL ?? `http://${DEFAULT_BRIDGE_HOST}:${DEFAULT_BRIDGE_PORT}/v1`
  const prompt = positionalText(rest)
  if (prompt.length === 0) {
    process.stderr.write("Usage: lazycc cursor ask [--api-key KEY] [--model MODEL] [--base-url URL] <prompt>\n")
    process.exitCode = 1
    return
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`
  if (dryRun) {
    process.stdout.write(`POST ${url} model=${model} prompt=${prompt}\n`)
    return
  }
  if (apiKey === undefined || apiKey.trim().length === 0) {
    process.stderr.write("Missing CURSOR_BRIDGE_API_KEY or --api-key.\n")
    process.exitCode = 1
    return
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  })
  const text = await response.text()
  if (!response.ok) {
    process.stderr.write(text.length > 0 ? `${text}\n` : `Cursor bridge request failed: ${response.status}\n`)
    process.exitCode = 1
    return
  }
  process.stdout.write(`${extractCompletionText(text)}\n`)
}

function extractCompletionText(text) {
  try {
    const parsed = JSON.parse(text)
    const content = parsed?.choices?.[0]?.message?.content
    return typeof content === "string" ? content : text
  } catch {
    return text
  }
}

function runCommand(commandName, commandArgs, cwd, env = {}) {
  if (dryRun) {
    process.stdout.write([commandName, ...commandArgs].join(" "))
    process.stdout.write("\n")
    return
  }
  const result = spawnSync(commandName, commandArgs, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  if (result.error) {
    process.stderr.write(`${result.error.message}\n`)
    process.exit(1)
  }
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1)
}

function readValue(argv, flag) {
  const index = argv.indexOf(flag)
  if (index === -1) return undefined
  const value = argv[index + 1]
  return value === undefined || value.startsWith("--") ? undefined : value
}

function positionalText(argv) {
  const words = []
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value.startsWith("--")) {
      index += 1
      continue
    }
    words.push(value)
  }
  return words.join(" ").trim()
}

function formatEnv(env) {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${shellToken(value)}`)
    .join(" ")
}

function shellToken(value) {
  return /^[A-Za-z0-9_./:-]+$/.test(value) ? value : JSON.stringify(value)
}

function printHelp() {
  process.stdout.write(`Usage:
  lazycc install [omo install args]
  lazycc bridge start [--backend mock|cursor-cli] [--api-key KEY] [--cursor-bin PATH]
  lazycc bridge doctor
  lazycc cursor ask [--api-key KEY] [--model MODEL] <prompt>
  lazycc <omo command>
`)
}

function bridgeHelp() {
  process.stdout.write("Usage: lazycc bridge <start|doctor> [options]\n")
}

function cursorHelp() {
  process.stdout.write("Usage: lazycc cursor ask [--api-key KEY] [--model MODEL] [--base-url URL] <prompt>\n")
}
