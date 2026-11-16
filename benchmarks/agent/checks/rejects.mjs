// node checks/rejects.mjs
// Checks that `act` reports a change the page refused or changed, on the react-zag-rejects screen.
// Scripted Playwright only: no agent runs. Starts the dev server when one isn't up.
import { spawn } from "node:child_process"
import assert from "node:assert/strict"
import path from "node:path"
import { chromium } from "@playwright/test"

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
const page = await browser.newPage()
const errors = []
page.on("pageerror", (error) => errors.push(String(error)))
const failures = []

async function check(name, fn) {
  try {
    await fn()
    console.log(`ok    ${name}`)
  } catch (error) {
    failures.push(name)
    console.log(`FAIL  ${name}\n      ${String(error.message).split("\n").join("\n      ")}`)
  }
}

try {
  await page.goto(`${app}/?screen=react-zag-rejects&agent`)
  await page.waitForSelector("body[data-mounted]")
  await page.waitForTimeout(300)
  const call = (name, input) => page.evaluate(([name, input]) => window.__agent[name](input), [name, input])
  const act = (...steps) => call("act", { steps })
  const checkedOf = async (label) => (await call("snapshot")).find((entry) => entry.label === label)?.checked

  await check("a refused toggle is rejected, and the snapshot keeps the original value", async () => {
    const result = await act({ ref: "Always off", action: "toggle" })
    assert.equal(result.ok, false)
    assert.equal(result.error, undefined)
    assert.deepEqual(result.rejected, [
      { step: 0, ref: result.rejected[0].ref, label: "Always off", requested: true, committed: false },
    ])
    assert.deepEqual(result.changed, {})
    assert.equal(await checkedOf("Always off"), false)
  })

  await check("a refused setChecked is rejected", async () => {
    const result = await act({ ref: "Always off", action: "setChecked", args: [true] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, true)
    assert.equal(result.rejected?.[0]?.committed, false)
  })

  await check("an accepted change is in changed, with nothing rejected", async () => {
    const result = await act({ ref: "Only on", action: "setChecked", args: [true] })
    assert.equal(result.ok, true)
    assert.equal(result.rejected, undefined)
    assert.equal(result.changed["Only on"], true)
    assert.equal(await checkedOf("Only on"), true)
  })

  await check("the same component refusing the other way is rejected", async () => {
    const result = await act({ ref: "Only on", action: "setChecked", args: [false] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, false)
    assert.equal(result.rejected?.[0]?.committed, true)
  })

  await check("a value the page changed to something else shows both values", async () => {
    const result = await act({ ref: "Coerced", action: "setChecked", args: [true] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, true)
    assert.equal(result.rejected?.[0]?.committed, "indeterminate")
    assert.equal(result.changed["Coerced"], "indeterminate")
    assert.equal(await checkedOf("Coerced"), "indeterminate")
  })

  await check("a rejection doesn't stop the steps after it, and each is reported", async () => {
    const result = await act(
      { ref: "Always off", action: "setChecked", args: [true] },
      { ref: "Only on", action: "setChecked", args: [true] },
      { ref: "Coerced", action: "setChecked", args: [false] },
    )
    assert.equal(result.ok, false)
    assert.equal(result.done.length, 3)
    assert.deepEqual(
      result.rejected.map((rejection) => [rejection.step, rejection.label, rejection.requested, rejection.committed]),
      [
        [0, "Always off", true, false],
        [2, "Coerced", false, "indeterminate"],
      ],
    )
  })

  await check("the page threw no errors", async () => assert.deepEqual(errors, []))
} finally {
  await browser.close()
  server?.kill()
}

console.log(failures.length ? `\n${failures.length} failed` : "\nAll passed")
process.exit(failures.length ? 1 : 0)
