import { expect, test } from "./_test"
import { TooltipModel } from "./models/tooltip.model"

let I: TooltipModel

test.describe("tooltip / animated triggers", () => {
  test.beforeEach(async ({ page }) => {
    I = new TooltipModel(page)
    await I.page.goto("/tooltip/animated-triggers")
  })

  test("shows the content of the hovered trigger", async () => {
    await I.getTrigger("bold").hover()
    await expect(I.getContent("bold")).toBeVisible()
    await expect(I.getContent("underline")).toBeHidden()
    await expect(I.getTrigger("bold")).toHaveAttribute(
      "aria-describedby",
      (await I.getContent("bold").getAttribute("id")) ?? "",
    )
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })

  test("exposes where the new trigger sits relative to the previous one", async () => {
    await I.getTrigger("bold").hover()
    await expect(I.getContent("bold")).toBeVisible()

    await I.getTrigger("underline").hover()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.getTrigger("italic").hover()
    await I.seeDataAttr(I.viewport, "activation-direction", "left")
  })

  test("animates the previous content out before hiding it", async () => {
    await I.getTrigger("bold").hover()
    await expect(I.getContent("bold")).toBeVisible()

    // Checked first: the switch only lasts as long as its animations
    await I.getTrigger("underline").hover()
    await I.seePositionerIsTransitioning()
    await I.seeDataAttr(I.getContent("bold"), "state", "closed")
    await I.seeDataAttr(I.getContent("underline"), "state", "open")

    await expect(I.getContent("bold")).toBeHidden()
    await I.seePositionerIsNotTransitioning()
  })

  test("resizes the viewport to the new content, with the arrow on the new trigger", async () => {
    await I.getTrigger("bold").hover()
    await expect(I.getContent("bold")).toBeVisible()
    await I.getTrigger("underline").hover()
    await I.seePositionerIsNotTransitioning()

    const viewportBox = await I.viewport.boundingBox()
    const contentBox = await I.getContent("underline").boundingBox()
    expect(Math.abs(viewportBox!.width - contentBox!.width)).toBeLessThan(1)

    const arrowBox = await I.arrow.boundingBox()
    const triggerBox = await I.getTrigger("underline").boundingBox()
    const arrowCenter = arrowBox!.x + arrowBox!.width / 2
    const triggerCenter = triggerBox!.x + triggerBox!.width / 2
    expect(Math.abs(arrowCenter - triggerCenter)).toBeLessThan(2)
  })

  test("clears the direction when closed", async () => {
    await I.getTrigger("bold").hover()
    await expect(I.getContent("bold")).toBeVisible()
    await I.getTrigger("underline").hover()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.page.mouse.move(0, 400)
    await expect(I.viewport).toBeHidden()
    await expect(I.arrow).toBeHidden()

    await I.getTrigger("italic").hover()
    await expect(I.getContent("italic")).toBeVisible()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })
})
