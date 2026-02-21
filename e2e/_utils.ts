import AxeBuilder from "@axe-core/playwright"
import { expect, type Locator, type Page } from "@playwright/test"

export async function a11y(page: Page, selector = "[data-part=root]", disableRules: string[] = []) {
  await page.waitForSelector(selector)

  const results = await new AxeBuilder({ page: page as any })
    .disableRules(["color-contrast", ...disableRules])
    .include(selector)
    .analyze()

  expect(results.violations).toEqual([])
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
    date: async (id: string, value: string) => {
      const el = page.locator(testid(id))
      await el.fill(value)
    },
  }
}

export const part = (part: string) => `[data-part=${esc(part)}]`

const esc = (str: string) => str.replace(/[-[\]{}()*+?:.,\\^$|#\s]/g, "\\$&")

export const clickViz = (page: Page) => page.locator("text=Visualizer").first().click()

export const clickControls = (page: Page) =>
  page.locator(".toolbar nav > button", { hasText: "Controls" }).first().click()

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
  release: boolean = true,
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
  if (release) {
    await page.mouse.up()
  }
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

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoffMultiplier?: number
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 100, backoffMultiplier = 1.5 } = options
  let currentDelay = delay
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay))
      currentDelay = Math.floor(currentDelay * backoffMultiplier)
    }
  }

  throw lastError!
}
