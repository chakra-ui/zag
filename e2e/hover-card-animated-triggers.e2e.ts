import { expect, test } from "./_test"
import { HoverCardModel } from "./models/hover-card.model"

let I: HoverCardModel

test.describe("hover-card / animated triggers", () => {
  test.beforeEach(async ({ page }) => {
    I = new HoverCardModel(page)
    await I.page.goto("/hover-card/animated-triggers")
  })

  test("shows the content of the hovered trigger", async () => {
    await I.getTrigger("ada").hover()
    await expect(I.getContent("ada")).toBeVisible()
    await expect(I.getContent("grace")).toBeHidden()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })

  test("animates to the new trigger's content", async () => {
    await I.getTrigger("ada").hover()
    await expect(I.getContent("ada")).toBeVisible()

    // Checked first: the switch only lasts as long as its animations
    await I.getTrigger("alan").hover()
    await I.seePositionerIsTransitioning()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")
    await I.seeDataAttr(I.getContent("ada"), "state", "closed")
    await I.seeDataAttr(I.getContent("alan"), "state", "open")

    await expect(I.getContent("ada")).toBeHidden()
    await I.seePositionerIsNotTransitioning()
  })

  test("resizes the viewport to the new content, with the arrow on the new trigger", async () => {
    await I.getTrigger("ada").hover()
    await expect(I.getContent("ada")).toBeVisible()
    await I.getTrigger("grace").hover()
    await expect(I.getContent("grace")).toBeVisible()
    await I.seePositionerIsNotTransitioning()

    const viewportBox = await I.viewport.boundingBox()
    const contentBox = await I.getContent("grace").boundingBox()
    expect(Math.abs(viewportBox!.width - contentBox!.width)).toBeLessThan(1)

    const arrowBox = await I.arrow.boundingBox()
    const triggerBox = await I.getTrigger("grace").boundingBox()
    expect(Math.abs(arrowBox!.x + arrowBox!.width / 2 - (triggerBox!.x + triggerBox!.width / 2))).toBeLessThan(2)
  })

  test("hides the arrow and clears the direction when closed", async () => {
    await I.getTrigger("ada").hover()
    await expect(I.getContent("ada")).toBeVisible()
    await I.getTrigger("alan").hover()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.page.mouse.move(5, 600)
    await expect(I.viewport).toBeHidden()
    await expect(I.arrow).toBeHidden()

    await I.getTrigger("grace").hover()
    await expect(I.getContent("grace")).toBeVisible()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })
})
