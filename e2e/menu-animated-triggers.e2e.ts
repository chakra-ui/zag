import { expect, test } from "./_test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("menu / animated triggers", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/menu/animated-triggers")
  })

  test("shows the content of the trigger that opened it", async () => {
    await I.getTrigger("file").click()
    await expect(I.getContent("file")).toBeVisible()
    await expect(I.getContent("edit")).toBeHidden()
    await expect(I.getTrigger("file")).toHaveAttribute(
      "aria-controls",
      (await I.getContent("file").getAttribute("id")) ?? "",
    )
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })

  test("exposes where the new trigger sits relative to the previous one", async () => {
    await I.getTrigger("file").click()
    await expect(I.getContent("file")).toBeVisible()

    await I.getTrigger("view").click()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.getTrigger("edit").click()
    await I.seeDataAttr(I.viewport, "activation-direction", "left")
  })

  test("animates the previous content out before hiding it", async () => {
    await I.getTrigger("file").click()
    await expect(I.getContent("file")).toBeVisible()

    // Checked first: the switch only lasts as long as its animations
    await I.getTrigger("view").click()
    await I.seePositionerIsTransitioning()
    await I.seeDataAttr(I.getContent("file"), "state", "closed")
    await I.seeDataAttr(I.getContent("view"), "state", "open")

    await expect(I.getContent("file")).toBeHidden()
    await I.seePositionerIsNotTransitioning()
  })

  test("keeps keyboard navigation and typeahead in the new content", async () => {
    await I.getTrigger("file").click()
    // Focus moves into the content a frame after opening
    await expect(I.getContent("file")).toBeFocused()
    await I.pressKey("ArrowDown", 2)
    await I.seeItemIsHighlighted("Open…")

    await I.getTrigger("view").click()
    await I.dontSeeHighlightedItem()
    await expect(I.getContent("view")).toBeFocused()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zoom in")
    await I.pressKey("ArrowDown", 5)
    await I.seeItemIsHighlighted("Toggle full screen mode")

    await I.pressKey("Z")
    await I.seeItemIsHighlighted("Zoom in")
  })

  test("resizes the viewport to the new content, with the arrow on the new trigger", async () => {
    await I.getTrigger("file").click()
    await expect(I.getContent("file")).toBeVisible()
    await I.getTrigger("view").click()
    await I.seePositionerIsNotTransitioning()

    const viewportBox = await I.viewport.boundingBox()
    const contentBox = await I.getContent("view").boundingBox()
    expect(Math.abs(viewportBox!.width - contentBox!.width)).toBeLessThan(1)
    expect(Math.abs(viewportBox!.height - contentBox!.height)).toBeLessThan(1)

    const arrowBox = await I.arrow.boundingBox()
    const triggerBox = await I.getTrigger("view").boundingBox()
    const arrowCenter = arrowBox!.x + arrowBox!.width / 2
    const triggerCenter = triggerBox!.x + triggerBox!.width / 2
    expect(Math.abs(arrowCenter - triggerCenter)).toBeLessThan(2)
  })

  test("hides the arrow and clears the direction when closed", async () => {
    await I.getTrigger("file").click()
    await I.getTrigger("view").click()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.pressKey("Escape")
    await expect(I.viewport).toBeHidden()
    await expect(I.arrow).toBeHidden()

    await I.getTrigger("edit").click()
    await expect(I.getContent("edit")).toBeVisible()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })
})
