import { expect, test } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler / drop constraints", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/constraints")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("a position inside business hours stays valid", async () => {
    await I.dragEventTo("1", 0, 40)
    await I.seeEventIsValid("1")
    await I.releaseDrag()
    await I.seeDropLog("drop:1")
  })

  test("[pointer] dragging above business hours marks the event invalid", async () => {
    const grid = await I.grid.boundingBox()
    if (!grid) throw new Error("missing grid")
    await I.dragEventTo("1", 0, -(grid.height / 2))
    await I.seeEventIsInvalid("1")
  })

  test("[pointer] releasing on an invalid position does not move the event", async () => {
    const before = await I.getEvent("1").boundingBox()
    const grid = await I.grid.boundingBox()
    if (!before || !grid) throw new Error("missing box")

    await I.dragEventTo("1", 0, -(grid.height / 2))
    await I.seeEventIsInvalid("1")
    await I.releaseDrag()

    await I.seeDropLog("")
    const after = await I.getEvent("1").boundingBox()
    expect(after?.y).toBeCloseTo(before.y, 0)
  })

  test("[keyboard] escape during an invalid drag restores the event", async () => {
    const before = await I.getEvent("1").boundingBox()
    const grid = await I.grid.boundingBox()
    if (!before || !grid) throw new Error("missing box")

    await I.dragEventTo("1", 0, -(grid.height / 2))
    await I.page.keyboard.press("Escape")
    await I.releaseDrag()

    await expect(I.getEvent("1")).not.toHaveAttribute("data-dragging", "")
    const after = await I.getEvent("1").boundingBox()
    expect(after?.y).toBeCloseTo(before.y, 0)
  })
})
