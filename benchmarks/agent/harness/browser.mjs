import { appendFileSync, mkdirSync } from "node:fs"
import { createServer } from "node:http"
import path from "node:path"
import { chromium } from "@playwright/test"

// Shaped like the Playwright MCP server's core tools: an accessibility
// snapshot with refs, and actions on refs that answer with the new snapshot.
function browserTools(page) {
  const snapshot = () => page.locator("body").ariaSnapshot({ mode: "ai" })
  const settled = async () => {
    await page.waitForTimeout(150)
    return snapshot()
  }
  return {
    snapshot,
    async click(ref) {
      await page.locator(`aria-ref=${ref}`).click({ timeout: 3000 })
      return settled()
    },
    async type(ref, text) {
      await page.locator(`aria-ref=${ref}`).fill(text, { timeout: 3000 })
      return settled()
    },
    async press(key) {
      await page.keyboard.press(key)
      return settled()
    },
  }
}

function agentTools(page, tools) {
  const call = (name) => (input) =>
    page.evaluate(([name, input]) => window.__agent[name](input), [name, input ? JSON.parse(input) : {}])
  return Object.fromEntries(tools.map((tool) => [tool.name, call(tool.name)]))
}

/**
 * Opens one screen in its own browser and serves its tools on this machine
 * only, to requests that carry `token`, so an agent's tool call is one short
 * command. `tools` is "browser" or "agent".
 */
async function openScreen({ app, screen, tools, port, token, dir, label, panels, headed = false, x = 0, width = 480 }) {
  mkdirSync(dir, { recursive: true })
  const browser = await chromium.launch({
    headless: !headed,
    executablePath: process.env.CHROMIUM,
    args: headed ? [`--window-position=${x},0`, `--window-size=${width},960`] : [],
  })
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const query = new URLSearchParams({
    screen,
    ...(label ? { label } : {}),
    ...(panels ? { panels } : {}),
  })
  await page.goto(`${app}/?${query}${tools === "agent" ? "&agent" : ""}`)
  await page.waitForSelector("body[data-mounted]")

  const described = tools === "agent" ? await page.evaluate(() => window.__agentTools) : null
  const available = described ? agentTools(page, described) : browserTools(page)
  const started = Date.now()
  const stats = { calls: 0, chars: 0, done: false, saved: [] }

  async function answer(request) {
    let body = ""
    for await (const chunk of request) {
      body += chunk
    }
    const { tool, args = [] } = JSON.parse(body || "{}")
    const at = Date.now()
    stats.calls++
    if (tool === "done") {
      stats.saved = await page.evaluate(() => window.__saved ?? [])
      stats.done = true
      return "Done."
    }
    let result
    try {
      if (!Object.hasOwn(available, tool)) {
        const names = [...Object.keys(available), "done"].join(", ")
        throw new Error(`Unknown tool ${tool}. Tools: ${names}`)
      }
      result = await available[tool](...args)
    } catch (error) {
      result = { error: String(error?.message ?? error).split("\n")[0] }
    }
    const text = typeof result === "string" ? result : JSON.stringify(result)
    stats.chars += text.length
    // The result's text too, so a run can be read back to see what the model was shown before each next call.
    appendFileSync(
      path.join(dir, "calls.jsonl"),
      `${JSON.stringify({ at: at - started, ms: Date.now() - at, tool, args, chars: text.length, output: text })}\n`,
    )
    return text
  }

  const server = createServer(async (request, response) => {
    if (request.headers.authorization !== `Bearer ${token}`) {
      response.writeHead(401).end("Unauthorized.")
      return
    }
    try {
      response.end(await answer(request))
    } catch {
      response.writeHead(400).end("Bad request.")
    }
  })
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve))

  return {
    stats,
    tools: described,
    async close() {
      server.close()
      await browser.close()
    },
  }
}

export { openScreen }
