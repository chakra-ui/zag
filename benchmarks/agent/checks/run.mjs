// pnpm --filter zag-agent-benchmark check [name...]
// Scripted Playwright checks of the screens and their agent tools. No agent runs and no Claude usage.
// Starts the dev server when one isn't up. Each check file exports a default function given { open, check }.
import { spawn } from "node:child_process"
import path from "node:path"
import { chromium } from "@playwright/test"

const all = ["task", "unmount", "browser", "rejects", "safety", "components"]
const names = process.argv.slice(2).length ? process.argv.slice(2) : all

const port = Number(process.env.BENCHMARK_PORT ?? 5410)
const app = `http://localhost:${port}`
const isUp = () =>
  fetch(app).then(
    (response) => response.text().then((html) => html.includes('name="agent-benchmark"')),
    () => false,
  )

let server
if (!(await isUp())) {
  server = spawn("pnpm", ["dev"], {
    cwd: path.join(import.meta.dirname, ".."),
    env: { ...process.env, BENCHMARK_PORT: String(port) },
    stdio: "ignore",
  })
  for (let tries = 0; tries < 120 && !(await isUp()); tries++) {
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

const browser = await chromium.launch()
const failures = []

// Opens a screen with its agent tools on the page, and gives shortcuts to them.
async function open(query) {
  const page = await browser.newPage({ viewport: { width: 480, height: 900 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`${app}/?${new URLSearchParams(query)}`)
  await page.waitForSelector("body[data-mounted]")
  await page.waitForTimeout(300)
  const call = (name, input) => page.evaluate(([name, input]) => window.__agent[name](input), [name, input])
  return {
    page,
    errors,
    call,
    snapshot: () => call("snapshot"),
    act: (...steps) => call("act", { steps }),
    saved: () => page.evaluate(() => window.__saved ?? []),
  }
}

async function check(name, fn) {
  try {
    await fn()
    console.log(`ok    ${name}`)
  } catch (error) {
    failures.push(name)
    console.log(
      `FAIL  ${name}\n      ${String(error?.message ?? error)
        .split("\n")
        .join("\n      ")}`,
    )
  }
}

try {
  for (const name of names) {
    console.log(`\n${name}`)
    const { default: run } = await import(`./${name}.mjs`)
    await run({ open, check })
  }
} finally {
  await browser.close()
  server?.kill()
}

console.log(failures.length ? `\n${failures.length} failed` : "\nAll passed")
process.exit(failures.length ? 1 : 0)
