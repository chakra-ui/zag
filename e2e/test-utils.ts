import AxeBuilder from "@axe-core/playwright"
import { expect, Page } from "@playwright/test"

export async function a11y(page: Page, selector = "[data-part=root]") {
  const results = await new AxeBuilder({ page }).include(selector).analyze()
  expect(results.violations).toEqual([])
}

export const testid = (part: string) => `[data-testid=${esc(part)}]`

export const part = (part: string) => `[data-part=${esc(part)}]`

const esc = (str: string) => str.replace(/[-[\]{}()*+?:.,\\^$|#\s]/g, "\\$&")

export const setup = (id: string) => ({
  id: testid(id),
  el: (page: Page) => page.locator(testid(id)),
})

export const tick = async (page: Page) => await page.waitForTimeout(16.66667)

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
