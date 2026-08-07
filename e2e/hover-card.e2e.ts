import { expect, test } from "@playwright/test"
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

    test("should anchor to the line the pointer is on, not the union of every line", async () => {
      await I.goto("/hover-card/inline")

      const lines = await I.triggerLines()
      expect(lines.length).toBeGreaterThan(2)

      const first = await I.hoverLine(0)
      await I.seeContent()
      await I.seeCardAnchoredTo(first)

      await I.moveClearOfParagraph()
      await I.waitOutCloseDelay()
      await I.dontSeeContent()

      const last = await I.hoverLine(lines.length - 1)
      await I.seeContent()
      await I.seeCardAnchoredTo(last)
    })

    test("should track the pointer across lines while warming up", async () => {
      await I.goto("/hover-card/inline")

      const lines = await I.triggerLines()
      const first = lines[0]
      const last = lines[lines.length - 1]

      await I.page.mouse.move(first.x + first.width / 2, first.y + first.height / 2, { steps: 4 })
      await I.page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 4 })
      await I.advance(OPEN_DELAY)

      await I.seeContent()
      await I.seeCardAnchoredTo(last)
    })

    test("should not carry one trigger's line over to another", async () => {
      await I.goto("/hover-card/inline")

      const first = await I.hoverLine(0)
      await I.seeContent()
      await I.seeCardAnchoredTo(first)

      // Switched by button, so the pointer never reaches B.
      const otherLines = await I.otherTriggerLines()
      await I.switchTrigger()

      await I.seeContent()
      await I.seeCardAnchoredTo(otherLines[otherLines.length - 1])
      await I.dontSeeCardAnchoredTo(otherLines[0])
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
