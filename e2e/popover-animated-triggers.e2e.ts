import { expect, test } from "./_test"
import { PopoverModel } from "./models/popover.model"

let I: PopoverModel

test.describe("popover / animated triggers", () => {
  test.beforeEach(async ({ page }) => {
    I = new PopoverModel(page)
    await I.goto("/popover/animated-triggers")
  })

  test("shows the content of the trigger that opened it", async () => {
    await I.getTrigger("notifications").click()
    await expect(I.getContent("notifications")).toBeVisible()
    await expect(I.getContent("profile")).toBeHidden()
    await expect(I.getTrigger("notifications")).toHaveAttribute(
      "aria-controls",
      (await I.getContent("notifications").getAttribute("id")) ?? "",
    )
  })

  test("has no activation direction when opened", async () => {
    await I.getTrigger("notifications").click()
    await expect(I.viewport).toBeVisible()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
  })

  test("exposes where the new trigger sits relative to the previous one", async () => {
    await I.getTrigger("notifications").click()
    await I.getTrigger("profile").click()
    await I.seeDataAttr(I.viewport, "activation-direction", "right")

    await I.getTrigger("activity").click()
    await I.seeDataAttr(I.viewport, "activation-direction", "left")
  })

  test("animates the previous content out before hiding it", async () => {
    await I.getTrigger("notifications").click()

    // Checked first: the switch only lasts as long as its animations
    await I.getTrigger("profile").click()
    await I.seePositionerIsTransitioning()
    await I.seeDataAttr(I.getContent("notifications"), "state", "closed")
    await I.seeDataAttr(I.getContent("profile"), "state", "open")

    await expect(I.getContent("notifications")).toBeHidden()
    await I.seePositionerIsNotTransitioning()
  })

  test("resizes the viewport to the new content, under the new trigger", async () => {
    await I.getTrigger("notifications").click()
    await I.getTrigger("profile").click()
    await I.seePositionerIsNotTransitioning()

    const viewportBox = await I.viewport.boundingBox()
    const contentBox = await I.getContent("profile").boundingBox()
    const triggerBox = await I.getTrigger("profile").boundingBox()
    expect(Math.abs(viewportBox!.width - contentBox!.width)).toBeLessThan(1)
    expect(Math.abs(viewportBox!.height - contentBox!.height)).toBeLessThan(1)
    expect(viewportBox!.x).toBeLessThanOrEqual(triggerBox!.x + triggerBox!.width)
    expect(viewportBox!.x + viewportBox!.width).toBeGreaterThanOrEqual(triggerBox!.x)
  })

  test("points the arrow at the new trigger", async () => {
    await I.getTrigger("notifications").click()
    await I.getTrigger("profile").click()
    await I.seePositionerIsNotTransitioning()

    const arrowBox = await I.arrow.boundingBox()
    const triggerBox = await I.getTrigger("profile").boundingBox()
    const arrowCenter = arrowBox!.x + arrowBox!.width / 2
    const triggerCenter = triggerBox!.x + triggerBox!.width / 2
    expect(Math.abs(arrowCenter - triggerCenter)).toBeLessThan(2)
  })

  test("tabs through the triggers when the content has nothing focusable", async () => {
    await I.getTrigger("notifications").focus()
    await I.pressKey("Enter")
    await I.seeContentIsFocused("notifications")

    await I.pressKey("Tab")
    await I.seeTriggerIsFocused("activity")

    await I.pressKey("Tab")
    await I.seeTriggerIsFocused("profile")

    await I.pressKey("Shift+Tab")
    await I.seeTriggerIsFocused("activity")
  })

  test("clears the direction when closed", async () => {
    await I.getTrigger("notifications").click()
    await I.getTrigger("profile").click()
    await I.pressKey("Escape")
    await expect(I.viewport).toBeHidden()
    await expect(I.arrow).toBeHidden()

    await I.getTrigger("activity").click()
    await I.dontSeeDataAttr(I.viewport, "activation-direction")
    await I.seePositionerIsNotTransitioning()
  })

  test("says why an animation should be skipped", async () => {
    await I.getTrigger("notifications").focus()
    await I.pressKey("Enter")
    await I.seeDataAttr(I.viewport, "instant", "click")

    await I.pressKey("Escape")
    await I.seeDataAttr(I.positioner, "instant", "dismiss")

    await I.getTrigger("notifications").click()
    await I.dontSeeDataAttr(I.viewport, "instant")

    await I.getTrigger("profile").click()
    await I.seePositionerIsNotTransitioning()
    await I.seeDataAttr(I.positioner, "instant", "trigger-change")
  })
})
