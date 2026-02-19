import { test } from "@playwright/test"
import { ListboxModel } from "./models/listbox.model"

let I: ListboxModel

test.describe("listbox", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("no highlighted item, arrow down", async () => {
    await I.tabToContent()
    await I.seeItemIsHighlighted("Andorra")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("United Arab Emirates")
  })

  test("no highlighted item, arrow up", async () => {
    await I.controls.bool("loopFocus", true)
    await I.tabToContent()
    await I.seeItemIsHighlighted("Andorra")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Zimbabwe")
  })

  test("should scroll selected option into view", async () => {
    await I.tabToContent()
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Zimbabwe")
    await I.seeItemInViewport("Zimbabwe")
  })
})
