import { expect, test } from "@playwright/test"
import { TocModel } from "./models/toc.model"

let I: TocModel

test.describe("toc / nav inside scroll container", () => {
  test.beforeEach(async ({ page }) => {
    I = new TocModel(page)
    await I.goto("/toc/nested-nav")
  })

  test("clicking a link scrolls all the way to its heading", async () => {
    await I.clickLink("usage")
    await I.seeHeadingNearTop("usage")
  })

  test("keeps the active item visible by scrolling only the nav", async () => {
    await I.scrollContentToEnd()
    await I.seeActiveItemInNav()
    await expect.poll(() => I.nav.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })
})
