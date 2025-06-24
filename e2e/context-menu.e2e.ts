import { test } from "@playwright/test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("context menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/context-menu")
  })

  test("should open on right click", async () => {
    await I.clickContextTrigger()

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })

  test("keyboard navigation works", async () => {
    await I.clickContextTrigger()

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Delete")
  })
})
