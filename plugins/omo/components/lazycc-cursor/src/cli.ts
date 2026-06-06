#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const componentRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginRoot = dirname(dirname(componentRoot));
const repoRoot = resolve(pluginRoot, "..", "..");
const bridgeRoot = resolve(repoRoot, "packages", "cursor-ai-proxy-bridge");
const defaultHost = "127.0.0.1";
const defaultPort = "9994";

const argv = process.argv.slice(2);
const command = argv[0] ?? "help";

if (command === "bridge") {
	startBridge(argv.slice(1));
} else if (command === "ask") {
	askCursor(argv.slice(1));
} else {
	process.stdout.write("Usage: lazycc-cursor bridge [--backend mock|cursor-cli] [--api-key KEY] | ask <prompt>\n");
}

function startBridge(args: readonly string[]): void {
	assertBridgeRoot();
	const backend = readValue(args, "--backend") ?? process.env.CURSOR_BRIDGE_BACKEND ?? "cursor-cli";
	const apiKey = readValue(args, "--api-key") ?? process.env.CURSOR_BRIDGE_API_KEY ?? "sk-lazycc-local";
	const host = readValue(args, "--host") ?? process.env.CURSOR_BRIDGE_HOST ?? defaultHost;
	const port = readValue(args, "--port") ?? process.env.CURSOR_BRIDGE_PORT ?? defaultPort;
	run("npm", ["install", "--prefix", bridgeRoot]);
	run("npm", ["run", "build", "--prefix", bridgeRoot]);
	run("node", [join(bridgeRoot, "dist", "index.js")], {
		CURSOR_BRIDGE_HOST: host,
		CURSOR_BRIDGE_PORT: port,
		CURSOR_BRIDGE_BACKEND: backend,
		CURSOR_BRIDGE_API_KEY: apiKey,
	});
}

function askCursor(args: readonly string[]): void {
	const prompt = positionalText(args);
	if (prompt.length === 0) {
		process.stderr.write("Usage: lazycc-cursor ask <prompt>\n");
		process.exit(1);
	}
	const rootLazycc = join(repoRoot, "bin", "lazycc.js");
	run(process.execPath, [rootLazycc, "cursor", "ask", ...args]);
}

function assertBridgeRoot(): void {
	if (existsSync(join(bridgeRoot, "package.json"))) return;
	process.stderr.write(`Vendored Cursor bridge not found: ${bridgeRoot}\n`);
	process.exit(1);
}

function run(commandName: string, args: readonly string[], env: Record<string, string> = {}): void {
	const result = spawnSync(commandName, [...args], {
		env: { ...process.env, ...env },
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.error !== undefined) {
		process.stderr.write(`${result.error.message}\n`);
		process.exit(1);
	}
	const status = result.status ?? 1;
	if (status !== 0) process.exit(status);
}

function readValue(argv: readonly string[], flag: string): string | undefined {
	const index = argv.indexOf(flag);
	if (index === -1) return undefined;
	const value = argv[index + 1];
	return value === undefined || value.startsWith("--") ? undefined : value;
}

function positionalText(argv: readonly string[]): string {
	const words: string[] = [];
	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (value.startsWith("--")) {
			index += 1;
			continue;
		}
		words.push(value);
	}
	return words.join(" ").trim();
}
