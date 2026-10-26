import { expect, test } from "./_test"
import { TocModel } from "./models/toc.model"

let I: TocModel

test.describe("toc", () => {
  test.beforeEach(async ({ page }) => {
    I = new TocModel(page)
    await I.goto()
  })

  test("marks every visible heading as active", async () => {
    await I.seeSeveralActiveItems()
  })

  test.describe("single", () => {
    test.beforeEach(async () => {
      await I.setMultiple(false)
    })

    test("marks only the topmost visible heading as active", async () => {
      await I.scrollToHeading("installation")
      await I.seeActiveItemCount(1)
    })

    test("activates every heading in order while scrolling", async () => {
      const order = await I.scrollThroughContent()
      expect(order).toEqual(await I.getItemValues())
    })

    test("activates the last heading at the end of the page", async () => {
      await I.scrollToEnd()
      await I.seeActiveItemCount(1)
      await I.seeItemIsActive("troubleshooting")
    })

    test("keeps a clicked item active when it can't scroll to the top", async () => {
      await I.clickLink("api-reference")
      await I.seeLinkIsCurrent("api-reference")
      await I.page.waitForTimeout(500)
      await I.seeActiveItemCount(1)
      await I.seeItemIsActive("api-reference")
    })
  })
})

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
    await I.scrollToEnd()
    await I.seeActiveItemInNav()
    await expect.poll(() => I.nav.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })
})
