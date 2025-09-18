import { test } from "@playwright/test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("context menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/context-menu")
  })

  test("should open on right click", async () => {
    await I.clickContextTrigger({ button: "right" })

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })

  test("keyboard navigation works", async () => {
    await I.clickContextTrigger({ button: "right" })

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Delete")
  })

  test("should reposition when right-clicking at same coordinates", async () => {
    // Right click to open context menu
    await I.clickContextTrigger({ button: "right" })
    await I.seeDropdown()
    await I.seeMenuIsPositioned()

    // Left click to close menu without moving mouse
    await I.clickContextTrigger({ button: "left" })
    await I.dontSeeDropdown()

    // Right click again at same coordinates
    await I.clickContextTrigger({ button: "right" })
    await I.seeDropdown()
    await I.seeMenuIsPositioned()
  })
})
