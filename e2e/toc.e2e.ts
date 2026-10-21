import { expect, test, type Page } from "@playwright/test"
import { controls } from "./_utils"

const item = (value: string) => `[data-scope=toc][data-part=item][data-value=${value}]`
const link = (value: string) => `[data-scope=toc][data-part=link][data-value=${value}]`
const activeItems = "[data-scope=toc][data-part=item][data-active]"

const scrollToEnd = (page: Page) =>
  page.locator("#introduction").evaluate((el) => {
    let container = el.parentElement!
    while (container.scrollHeight <= container.clientHeight) container = container.parentElement!
    container.scrollTop = container.scrollHeight
  })

test.describe("toc", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/toc/indicator")
  })

  test("marks every visible heading as active", async ({ page }) => {
    await expect(page.locator(activeItems)).not.toHaveCount(0)
    await expect(page.locator(activeItems)).not.toHaveCount(1)
  })

  test("[single] marks only the topmost visible heading as active", async ({ page }) => {
    await controls(page).bool("multiple", false)
    await page.locator("#installation").scrollIntoViewIfNeeded()
    await expect(page.locator(activeItems)).toHaveCount(1)
  })

  test("[single] activates the last heading in view at the end of the scroll", async ({ page }) => {
    await controls(page).bool("multiple", false)
    await scrollToEnd(page)
    await expect(page.locator(activeItems)).toHaveCount(1)
    await expect(page.locator(item("troubleshooting"))).toHaveAttribute("data-active")
  })

  test("[single] keeps a clicked item active when the page cannot scroll it to the top", async ({ page }) => {
    await controls(page).bool("multiple", false)
    await page.click(link("api-reference"))
    await expect(page.locator(link("api-reference"))).toHaveAttribute("aria-current", "location")
    await page.waitForTimeout(500)
    await expect(page.locator(activeItems)).toHaveCount(1)
    await expect(page.locator(item("api-reference"))).toHaveAttribute("data-active")
  })
})
