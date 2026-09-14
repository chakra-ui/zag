import { expect, test } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler / external drop", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/external-drop")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("starts with an empty grid and a full backlog", async () => {
    await expect(I.events).toHaveCount(0)
    await expect(I.backlogItems).toHaveCount(3)
  })

  test("[pointer] dropping a backlog item creates an event on that slot", async () => {
    await I.dragBacklogItemToGrid("b1")

    await expect(I.getEvent("b1")).toBeVisible()
    await expect(I.getEvent("b1")).toContainText("Write RFC")
    // the item leaves the backlog once scheduled
    await expect(I.getBacklogItem("b1")).toHaveCount(0)
    await expect(I.backlogItems).toHaveCount(2)
  })

  test("[pointer] a second drop lands independently", async () => {
    await I.dragBacklogItemToGrid("b1", 0.25)
    await I.dragBacklogItemToGrid("b2", 0.6)

    await expect(I.getEvent("b1")).toBeVisible()
    await expect(I.getEvent("b2")).toBeVisible()

    const first = await I.getEvent("b1").boundingBox()
    const second = await I.getEvent("b2").boundingBox()
    expect(second!.y).toBeGreaterThan(first!.y)
  })
})
