// pnpm --filter zag-agent-benchmark bench --runs 3
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { parseArgs } from "node:util"
import { openScreen } from "./browser.mjs"
import { isCorrect, prompt, system, toolPath } from "./task.mjs"

const frameworks = {
  react: [
    { screen: "react-ui-sdk", tools: "browser", library: "ui-sdk" },
    { screen: "react-ui-sdk", tools: "agent", library: "ui-sdk" },
    { screen: "react-zag", tools: "browser", library: "Zag" },
    { screen: "react-zag", tools: "agent", library: "Zag" },
  ],
}

const { values: flags } = parseArgs({
  options: {
    framework: { type: "string", default: "react" },
    model: { type: "string", default: "sonnet" },
    runs: { type: "string", default: "1" },
    headless: { type: "boolean", default: false },
    width: { type: "string", default: "480" },
    out: { type: "string" },
    panels: { type: "string", default: "unmount" },
  },
})
const arms = frameworks[flags.framework]
if (!arms) {
  console.error(`Frameworks: ${Object.keys(frameworks).join(", ")}.`)
  process.exit(1)
}
const out = flags.out ?? mkdtempSync(path.join(tmpdir(), "agent-benchmark-"))
const width = Number(flags.width)
const token = randomUUID()
const children = []
// Each agent's empty working folder, removed when the bench stops.
const workdirs = []
const stop = () => {
  children.forEach((child) => child.kill())
  workdirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
}
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stop()
    process.exit(0)
  })
}

function run(command, args, options) {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })
  children.push(child)
  let output = ""
  child.stdout.on("data", (chunk) => (output += chunk))
  const closed = new Promise((resolve) => {
    child.on("error", () => resolve(null))
    child.on("close", () => resolve(output))
  })
  return { child, closed }
}

async function claude(args, options) {
  const output = await run("claude", [...args, "--output-format", "json", "--model", flags.model], options).closed
  if (output === null) {
    return { missing: true }
  }
  try {
    return JSON.parse(output)
  } catch {
    return { is_error: true, result: output }
  }
}

async function appUrl() {
  const isOurs = (port) =>
    fetch(`http://localhost:${port}`).then(
      (response) => response.text().then((html) => html.includes('name="agent-benchmark"')),
      () => false,
    )
  const isTaken = (port) =>
    fetch(`http://localhost:${port}`).then(
      () => true,
      () => false,
    )
  let port = 5410
  if (await isOurs(port)) {
    return `http://localhost:${port}`
  }
  while (await isTaken(port)) {
    port++
  }
  run("pnpm", ["dev"], {
    cwd: path.join(import.meta.dirname, ".."),
    env: { ...process.env, BENCHMARK_PORT: String(port) },
  })
  for (let tries = 0; tries < 120; tries++) {
    if (await isOurs(port)) {
      return `http://localhost:${port}`
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error("The benchmark app didn't start.")
}

// Both get the same short system prompt and only Bash, limited to the one
// command, in an empty folder, so the numbers compare the tools and nothing else.
async function operate(arm, round, app) {
  const port = 5600 + arms.indexOf(arm)
  const screen = await openScreen({
    app,
    port,
    token,
    screen: arm.screen,
    tools: arm.tools,
    dir: path.join(out, `${round}`, `${arm.screen}-${arm.tools}`),
    label: `${arm.library} + ${arm.tools} tools`,
    panels: flags.panels,
    headed: !flags.headless,
    x: arms.indexOf(arm) * width,
    width,
  })
  const started = Date.now()
  const cwd = mkdtempSync(path.join(tmpdir(), "agent-benchmark-cwd-"))
  workdirs.push(cwd)
  const result = await claude(
    [
      "-p",
      prompt({ port, tools: screen.tools }),
      "--system-prompt",
      system,
      "--tools",
      "Bash",
      "--disable-slash-commands",
      "--strict-mcp-config",
      "--allowedTools",
      `Bash(node ${toolPath}:*)`,
    ],
    {
      cwd,
      env: { ...process.env, AGENT_BENCHMARK_TOKEN: token },
    },
  )
  const usage = result.usage ?? {}
  const measured = {
    library: arm.library,
    tools: arm.tools,
    calls: screen.stats.calls,
    chars: screen.stats.chars,
    seconds: (Date.now() - started) / 1000,
    tokens:
      (usage.input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.output_tokens ?? 0),
    cost: result.total_cost_usd ?? 0,
    correct: screen.stats.done && isCorrect(screen.stats.saved),
    message: result.result ?? "",
  }
  await screen.close()
  return measured
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function table(rows) {
  const columns = [
    ["Library", (row) => row.library],
    ["Tools", (row) => row.tools],
    ["Tool calls", (row) => row.calls],
    ["Text read", (row) => `${(row.chars / 1000).toFixed(1)}k`],
    ["Time", (row) => `${row.seconds.toFixed(0)} s`],
    ["Tokens", (row) => `${(row.tokens / 1000).toFixed(1)}k`],
    ["Cost", (row) => `$${row.cost.toFixed(3)}`],
    ["Correct", (row) => (typeof row.correct === "string" ? row.correct : row.correct ? "yes" : "no")],
  ]
  const cells = [columns.map(([title]) => title), ...rows.map((row) => columns.map(([, show]) => String(show(row))))]
  const widths = columns.map((_, index) => Math.max(...cells.map((line) => line[index].length)))
  return cells.map((line) => line.map((cell, index) => cell.padEnd(widths[index])).join("  ")).join("\n")
}

const check = await claude(["-p", "Reply with ok."])
if (check.missing) {
  console.error("The Claude Code CLI isn't installed: https://claude.com/claude-code")
  process.exit(1)
}
if (check.is_error) {
  console.error(`Claude Code can't run: ${check.result}`)
  process.exit(1)
}

const app = await appUrl()
const rounds = []
for (let round = 1; round <= Number(flags.runs); round++) {
  const rows = await Promise.all(arms.map((arm) => operate(arm, round, app)))
  rounds.push(rows)
  console.log(`\nRun ${round}, ${flags.framework}, ${flags.model}, panels ${flags.panels}\n`)
  console.log(table(rows))
}

const medians = arms.map((arm, index) => {
  const runs = rounds.map((rows) => rows[index])
  const of = (key) => median(runs.map((row) => row[key]))
  return {
    library: arm.library,
    tools: arm.tools,
    calls: of("calls"),
    chars: of("chars"),
    seconds: of("seconds"),
    tokens: of("tokens"),
    cost: of("cost"),
    correct: `${runs.filter((row) => row.correct).length}/${runs.length}`,
  }
})
if (rounds.length > 1) {
  console.log(`\nMedian of ${rounds.length} runs\n`)
  console.log(table(medians))
}
writeFileSync(
  path.join(out, "results.json"),
  JSON.stringify(
    {
      framework: flags.framework,
      model: flags.model,
      panels: flags.panels,
      rounds,
      medians,
    },
    null,
    2,
  ),
)
console.log(`\nResults and every tool call: ${out}`)
stop()
process.exit(0)
