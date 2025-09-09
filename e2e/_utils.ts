import AxeBuilder from "@axe-core/playwright"
import { expect, type Locator, type Page } from "@playwright/test"

// Types and Framework Context Detection
export type DomMode = "shadow-dom" | "light-dom"

// The context is determined by environment variables at test runtime
// VITE_DOM_MODE is the primary control (matches client-side behavior)
// Examples:
// - `VITE_DOM_MODE=shadow-dom FRAMEWORK=react npx playwright test` (force Shadow DOM in React)
// - `VITE_DOM_MODE=light-dom FRAMEWORK=lit npx playwright test` (force Light DOM in Lit)
// - `FRAMEWORK=lit npx playwright test` (default Lit behavior: Shadow DOM)
export const DOM_MODE: DomMode =
  process.env.VITE_DOM_MODE === "light-dom" ? "light-dom" : process.env.FRAMEWORK === "lit" ? "shadow-dom" : "light-dom"

console.log(`Running E2E tests in '${DOM_MODE}' context for '${process.env.FRAMEWORK}'.`)

/**
 * Context-aware utility to locate a component part defined by a 'part' or 'data-part' attribute.
 * This function abstracts the structural differences between Shadow DOM and Light DOM implementations.
 *
 * @param parent The root Playwright Page or a parent Locator to search within
 * @param hostSelector A unique selector for the component's host/root element (e.g., 'accordion-page', '[data-testid="accordion-root"]')
 * @param partName The name of the part to locate (e.g., 'trigger', 'content')
 * @returns A Playwright Locator for the requested part
 */
export function getPart(parent: Page | Locator, hostSelector: string, partName: string): Locator {
  // Use [part="..."] for CSS Shadow Parts standard, fallback to [data-part="..."]
  const partSelector = `[part="${partName}"], [data-part="${partName}"]`

  if (DOM_MODE === "shadow-dom") {
    // For Shadow DOM, use a descendant combinator. Playwright's engine will
    // pierce the shadow root of the element matching hostSelector.
    return parent.locator(`${hostSelector} ${partSelector}`)
  } else {
    // For Light DOM, the structure might be a direct child or a deeper descendant.
    // In many simple cases, the selector is identical to the shadow DOM version.
    return parent.locator(`${hostSelector} ${partSelector}`)
  }
}

/**
 * Performs an accessibility scan, optionally scoped to a specific selector.
 * @param page The Playwright Page object
 * @param selector Optional selector to scope the scan (defaults to "[data-part=root]")
 * @param hostSelector A CSS selector for a shadow host element
 */
export async function a11y(page: Page, selector = "[data-part=root]", hostSelector?: string) {
  await page.waitForSelector(selector)

  let selection = new AxeBuilder({ page: page as any }).disableRules(["color-contrast"])

  if (hostSelector && DOM_MODE === "shadow-dom") {
    selection = selection.include(hostSelector)
  }
  if (selector) {
    selection = selection.include(selector)
  }

  const accessibilityScanResults = await selection.analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}

export const testid = (part: string) => `[data-testid=${esc(part)}]`

export const controls = (page: Page) => {
  return {
    num: async (id: string, value: string) => {
      const el = page.locator(testid(id))
      await el.selectText()
      await page.keyboard.press("Backspace")
      await el.fill(value)
      await page.keyboard.press("Enter")
    },
    bool: async (id: string, value = true) => {
      const el = page.locator(testid(id))
      if (value) await el.check()
      else await el.uncheck()
    },
    select: async (id: string, value: string) => {
      const el = page.locator(testid(id))
      await el.selectOption(value)
    },
  }
}

export const part = (part: string) => `[data-part=${esc(part)}]`

const esc = (str: string) => str.replace(/[-[\]{}()*+?:.,\\^$|#\s]/g, "\\$&")

export const clickViz = (page: Page) => page.locator("text=Visualizer").first().click()

export const clickControls = (page: Page) => page.locator("text=Controls").first().click()

export const paste = (node: HTMLElement, value: string) => {
  const clipboardData = new DataTransfer()
  clipboardData.setData("text/plain", value)
  const event = new ClipboardEvent("paste", {
    clipboardData,
    bubbles: true,
    cancelable: true,
  })
  node.dispatchEvent(event)
}

export const nativeInput = (node: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const event = new InputEvent("input", {
    bubbles: true,
    inputType: "insertFromPaste",
  })

  const __input__setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  const __textarea__setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set

  const textValue = `${node.value}${value}`

  const set = node.localName === "input" ? __input__setter : __textarea__setter
  set?.call(node, textValue)

  node.dispatchEvent(event)
}

export const clickOutside = (page: Page) => page.click("body", { force: true })

export const rect = async (el: Locator) => {
  const bbox = await el.boundingBox()

  if (!bbox) {
    throw new Error("Element not found")
  }

  return {
    ...bbox,
    midX: bbox.x + bbox.width / 2,
    midY: bbox.y + bbox.height / 2,
    maxX: bbox.x + bbox.width,
    maxY: bbox.y + bbox.height,
  }
}

export async function isInViewport(viewport: Locator, el: Locator) {
  const bbox = await rect(el)
  const viewportBbox = await rect(viewport)
  return (
    bbox.x >= viewportBbox.x &&
    bbox.y >= viewportBbox.y &&
    bbox.x + bbox.width <= viewportBbox.x + viewportBbox.width &&
    bbox.y + bbox.height <= viewportBbox.y + viewportBbox.height
  )
}

export const repeat = async (count: number, fn: () => unknown) => {
  await [...new Array(count)].reduce((p) => p.then(fn), Promise.resolve())
}

export const pointer = {
  down(el: Locator) {
    return el.dispatchEvent("pointerdown", { pointerType: "mouse", button: 0 })
  },
  up(el: Locator) {
    return el.dispatchEvent("pointerup", { pointerType: "mouse", button: 0 })
  },
  async move(el: Locator) {
    await el.hover()
    return el.dispatchEvent("pointermove", { button: 0 })
  },
}

export const textSelection = (page: Page) => {
  return page.evaluate(() => window.getSelection()?.toString())
}

export type SwipeDirection = "left" | "right" | "up" | "down"

const swipeDirections = new Set<SwipeDirection>(["left", "right", "up", "down"])

export async function swipe(
  page: Page,
  locator: Locator,
  direction: SwipeDirection,
  distance: number = 100,
  duration: number = 500,
): Promise<void> {
  if (!swipeDirections.has(direction)) {
    throw new Error("Invalid direction. Use 'left', 'right', 'up', or 'down'.")
  }

  const box = await rect(locator)
  if (!box) {
    throw new Error("Could not determine the element bounding box.")
  }

  // Calculate start and end points for the swipe
  const startX = box.midX
  const startY = box.midY

  let endX = startX
  let endY = startY

  switch (direction) {
    case "left":
      endX = startX - distance
      break
    case "right":
      endX = startX + distance
      break
    case "up":
      endY = startY - distance
      break
    case "down":
      endY = startY + distance
      break
  }

  // Perform the swipe action using mouse drag
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY, { steps: Math.max(duration / 10, 1) }) // Smoothness based on duration
  await page.mouse.up()
}

export function moveCaret(input: Locator, start: number, end = start) {
  return input.evaluate((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.setSelectionRange(start, end)
    }

    throw new Error("Element is not an input or textarea")
  })
}

export function getCaret(input: Locator) {
  return input.evaluate((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return {
        start: el.selectionStart,
        end: el.selectionEnd,
      }
    }

    throw new Error("Element is not an input or textarea")
  })
}
