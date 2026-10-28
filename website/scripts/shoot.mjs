// Screenshots a route in light and dark (OS setting, no stored theme) for design review.
// Usage: node website/scripts/shoot.mjs <route> [--mobile] [--base=http://localhost:3200]
import { createRequire } from "node:module"
import { mkdirSync } from "node:fs"
import { join } from "node:path"

const require = createRequire(import.meta.url)
const { chromium } = require("@playwright/test")

const args = process.argv.slice(2)
const route = args.find((a) => a.startsWith("/")) ?? "/"
const mobile = args.includes("--mobile")
const base =
  args.find((a) => a.startsWith("--base="))?.slice(7) ?? "http://localhost:3200"
const outDir = join(import.meta.dirname, "..", ".shots")
mkdirSync(outDir, { recursive: true })

const viewport = mobile
  ? { width: 390, height: 844 }
  : { width: 1440, height: 900 }
const name =
  (route === "/" ? "home" : route.slice(1).replaceAll("/", "_")) +
  (mobile ? "-mobile" : "")

const browser = await chromium.launch()
let overflow = false
for (const colorScheme of ["light", "dark"]) {
  const page = await browser.newPage({
    viewport,
    colorScheme,
    reducedMotion: "reduce",
  })
  await page.goto(base + route, { waitUntil: "networkidle", timeout: 120_000 })
  await page.screenshot({
    path: join(outDir, `${name}-${colorScheme}.png`),
    fullPage: true,
  })
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  if (scrollWidth > innerWidth) {
    overflow = true
    console.log(`overflow ${colorScheme}: ${scrollWidth} > ${innerWidth}`)
  }
  await page.close()
}
await browser.close()
console.log(`${outDir}/${name}-{light,dark}.png`)
if (overflow) process.exit(1)
