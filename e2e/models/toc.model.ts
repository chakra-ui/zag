import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

const items = "[data-scope=toc][data-part=item]"
const activeItems = `${items}[data-active]`
const item = (value: string) => `${items}[data-value="${value}"]`
const link = (value: string) => `[data-scope=toc][data-part=link][data-value="${value}"]`

export class TocModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/toc/indicator") {
    return this.page.goto(url)
  }

  getActiveItems() {
    return this.page.locator(activeItems)
  }

  getItemValues() {
    return this.page.locator(items).evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.value!))
  }

  setMultiple(value: boolean) {
    return this.controls.bool("multiple", value)
  }

  clickLink(value: string) {
    return this.page.click(link(value))
  }

  scrollToHeading(value: string) {
    return this.page.locator(`[id="${value}"]`).scrollIntoViewIfNeeded()
  }

  async scrollToEnd() {
    const container = await this.getScrollContainer()
    await container.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
  }

  /**
   * Scrolls the content from top to bottom in small steps and returns the
   * order in which items became active.
   */
  async scrollThroughContent(step = 10) {
    const container = await this.getScrollContainer()
    return container.evaluate(
      async (el, { step, activeItems }) => {
        const order: string[] = []
        for (let y = 0; y <= el.scrollHeight; y += step) {
          el.scrollTop = y
          await new Promise((resolve) => setTimeout(resolve, 30))
          const value = document.querySelector<HTMLElement>(activeItems)?.dataset.value
          if (value && order.at(-1) !== value) order.push(value)
        }
        return order
      },
      { step, activeItems },
    )
  }

  async seeActiveItemCount(count: number) {
    await expect(this.getActiveItems()).toHaveCount(count)
  }

  async seeSeveralActiveItems() {
    await expect(this.getActiveItems()).not.toHaveCount(0)
    await expect(this.getActiveItems()).not.toHaveCount(1)
  }

  async seeItemIsActive(value: string) {
    await expect(this.page.locator(item(value))).toHaveAttribute("data-active")
  }

  async seeLinkIsCurrent(value: string) {
    await expect(this.page.locator(link(value))).toHaveAttribute("aria-current", "location")
  }

  // The nearest scrollable ancestor of the headings
  private async getScrollContainer() {
    const [firstValue] = await this.getItemValues()
    return this.page.locator(`[id="${firstValue}"]`).evaluateHandle((heading) => {
      let el = heading.parentElement!
      while (el.scrollHeight <= el.clientHeight) el = el.parentElement!
      return el
    })
  }
}
