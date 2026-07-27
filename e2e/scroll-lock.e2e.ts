import { expect, test } from "@playwright/test"
import { ScrollLockModel } from "./models/scroll-lock.model"

let I: ScrollLockModel

test.describe("scroll lock", () => {
  test.beforeEach(async ({ page }) => {
    I = new ScrollLockModel(page)
  })

  test.describe("scroll container targeting", () => {
    test.beforeEach(async () => {
      await I.gotoHtmlScroller()
    })

    test("locks <html> instead of <body> when html establishes the scroll container", async () => {
      await I.clickTrigger()
      await I.seeZagLockEventually() // the data-scroll-lock marker is always on body

      expect(await I.isHtmlLocked()).toBe(true)
      expect(await I.isBodyLocked()).toBe(false)
    })

    test("locks immediately when an external <body> lock cannot affect the page", async () => {
      // html owns the viewport scroll here; an overflow:hidden on body alone doesn't actually
      // lock anything and must not prevent zag from locking the real scroller.
      await I.page.evaluate(() => (document.body.style.overflowY = "hidden"))

      await I.clickTrigger()
      await I.seeZagLockEventually()

      expect(await I.isHtmlLocked()).toBe(true)

      await I.clickClose()
      await I.seeNoZagLockEventually()
    })
  })
})
