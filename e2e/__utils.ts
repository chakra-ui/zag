import AxeBuilder from "@axe-core/playwright"
import { expect, Locator, Page } from "@playwright/test"

export async function a11y(page: Page, selector = "[data-part=root]") {
  const results = await new AxeBuilder({ page }).include(selector).analyze()
  expect(results.violations).toEqual([])
}

export const testid = (part: string) => `[data-testid=${esc(part)}]`

export const controls = (page: Page) => {
  return {
    num: async (id: string, value: string) => {
      const el = page.locator(testid(id))
      await el.selectText()
      await page.keyboard.press("Backspace")
      await el.type(value)
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
  return bbox ?? { x: 0, y: 0, width: 0, height: 0 }
}
