import { expect, test } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler / resources", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/resources")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("renders one column per resource", async () => {
    await expect(I.columns).toHaveCount(4)
    await expect(I.getResourceColumn("amelia")).toBeVisible()
    await expect(I.getResourceColumn("brooke")).toBeVisible()
    await expect(I.getResourceColumn("chidi")).toBeVisible()
    await expect(I.getResourceColumn("dara")).toBeVisible()
  })

  test("scopes each event to its own resource column", async () => {
    await I.seeEventInResource("r-1", "amelia")
    await I.seeEventInResource("r-2", "brooke")
    await I.seeEventInResource("r-3", "chidi")

    // an event must not leak into a sibling resource. Amelia holds the deliberate conflict pair.
    await expect(I.getEventsInResource("amelia")).toHaveCount(2)
    await expect(I.getEventsInResource("brooke")).toHaveCount(1)
  })

  test("marks a disabled resource column", async () => {
    await I.seeResourceIsDisabled("dara")
  })

  test("column headers carry their resource", async () => {
    await expect(I.getResourceHeader("amelia")).toHaveText("Amelia Stone")
    await expect(I.getResourceHeader("brooke")).toHaveText("Brooke Chen")
  })

  test("[pointer] dragging within a resource reports that resource", async () => {
    await I.dragEvent("r-1", 0, 60)
    await expect(I.dropLog).toContainText("drop:r-1:amelia")
  })

  test("[pointer] the drag preview shows only in the dragged event's lane", async () => {
    await I.dragEventTo("r-1", 0, 60)
    // amelia owns r-1, so the other lanes must stay clear
    expect(await I.visibleDragOverlayResources()).toEqual(["amelia"])
    await I.releaseDrag()
  })

  test("[pointer] a disabled resource column does not start a slot selection", async () => {
    const box = await I.getResourceColumn("dara").boundingBox()
    if (!box) throw new Error("missing column")
    await I.page.mouse.move(box.x + box.width / 2, box.y + 20)
    await I.page.mouse.down()
    await I.page.mouse.move(box.x + box.width / 2, box.y + 80, { steps: 5 })
    await I.page.mouse.up()
    await expect(I.root).not.toHaveAttribute("data-selecting-slot", "")
  })
})
