import { test } from "@playwright/test"
import { part } from "./_utils"
import { HoverCardModel, OPEN_DELAY } from "./models/hover-card.model"

let I: HoverCardModel

test.describe("hover card", () => {
  test.beforeEach(async ({ page }) => {
    I = new HoverCardModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("content should be hidden by default", async () => {
    await I.dontSeeContent()
  })

  test("should open on hover", async () => {
    await I.hoverTrigger()
    await I.seeContent()
  })

  test("should have no accessibility violations in the content", async () => {
    await I.hoverTrigger()
    await I.seeContent()
    await I.checkAccessibility(part("hover-card", "content"))
  })

  test("should open on focus", async () => {
    await I.focusTrigger()
    await I.seeContent()
  })

  test("should close on blur", async () => {
    await I.focusTrigger()
    await I.seeContent()

    await I.blurTrigger()
    await I.waitOutCloseDelay()
    await I.dontSeeContent()
  })

  test("[keyboard] should close when tabbing away from the trigger", async () => {
    await I.clickMain()
    await I.pressKey("Tab")
    await I.advance(OPEN_DELAY)
    await I.seeContent()

    await I.pressKey("Tab")
    await I.waitOutCloseDelay()
    await I.dontSeeContent()
  })

  test("should stay open on blur when the pointer opened it", async () => {
    await I.hoverTrigger()
    await I.seeContent()

    await I.focusTrigger()
    await I.seeContent()

    await I.blurTrigger()
    await I.seeContent()

    await I.hoverTestText()
    await I.waitOutCloseDelay()
    await I.dontSeeContent()
  })

  test("should stay open when moving from the trigger to the content", async () => {
    await I.hoverTrigger()
    await I.seeContent()

    await I.hoverContent()
    await I.seeContent()
  })

  test("should stay open when moving from the content back to the trigger", async () => {
    await I.hoverTrigger()
    await I.seeContent()

    await I.hoverContent()
    await I.seeContent()

    await I.hoverTrigger()
    await I.seeContent()
  })

  test.describe("safe area", () => {
    test("should stay open while the pointer travels diagonally to the content", async () => {
      await I.hoverTrigger()
      await I.seeContent()

      await I.moveIntoCorridor()
      await I.waitOutCloseDelay()
      await I.seeContent()

      await I.moveOntoContent()
      await I.seeContent()
    })

    test("should close when the pointer leaves the safe area", async () => {
      await I.hoverTrigger()
      await I.seeContent()

      await I.moveAwayFromContent()
      await I.waitOutCloseDelay()
      await I.dontSeeContent()
    })

    test("should cancel the close when the pointer returns to the corridor", async () => {
      await I.hoverTrigger()
      await I.seeContent()

      // leave, then come back into the corridor before the close delay elapses
      await I.moveAwayFromContent()
      await I.moveIntoCorridor(-20)

      await I.waitOutCloseDelay()
      await I.seeContent()
    })

    test("should not close a default-open card until the pointer engages with it", async () => {
      await I.goto("/hover-card/default-open")
      await I.seeContent()

      // the pointer has never been on the trigger or the content, so wandering the page has no
      // relationship with this card
      await I.moveClearOfCard(40)
      await I.moveClearOfCard(700)
      await I.waitOutCloseDelay()
      await I.seeContent()

      // once it has actually been hovered, leaving closes it as usual
      await I.moveOntoContent()
      await I.moveClearOfCard(40)
      await I.waitOutCloseDelay()
      await I.dontSeeContent()
    })
  })
})
