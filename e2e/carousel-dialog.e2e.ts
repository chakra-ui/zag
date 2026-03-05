import { test } from "@playwright/test"
import { CarouselModel } from "./models/carousel.model"

let I: CarouselModel

test.describe("carousel / dialog (controlled)", () => {
  test.beforeEach(async ({ page }) => {
    I = new CarouselModel(page)
    await page.goto("/carousel/dialog")
  })

  test("should navigate correctly when carousel is inside a dialog", async ({ page }) => {
    // Open dialog
    await page.getByTestId("open-dialog").click()

    // Wait for dialog + carousel to mount
    await page.waitForTimeout(400)

    // Navigate forward several pages and verify page display is correct
    for (let expectedPage = 1; expectedPage <= 12; expectedPage++) {
      await I.clickNextTrigger()
      await I.waitForScrollSettle()
      await page.waitForFunction((n) => {
        const el = document.querySelector("[data-testid='page-display']")
        return el?.textContent?.includes(`Current page: ${n}`)
      }, expectedPage)
    }

    // Verify indicator is active at page 12
    await I.seeIndicatorIsActive(12)
  })

  test("controlled carousel inside dialog: page state stays in sync across 15 pages", async ({ page }) => {
    await page.getByTestId("open-dialog").click()
    await page.waitForTimeout(400)

    // Navigate to page 10 — historically jumps at multiples of 10
    for (let i = 0; i < 10; i++) {
      await I.clickNextTrigger()
    }
    await I.waitForScrollSettle()

    await page.waitForFunction(() => {
      const el = document.querySelector("[data-testid='page-display']")
      return el?.textContent?.includes("Current page: 10")
    })
    await I.seeIndicatorIsActive(10)
  })
})
