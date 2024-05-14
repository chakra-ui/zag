import { test } from "@playwright/test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("on arrow up and down, change highlighted item", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown", 2)
    await I.seeItemIsHighlighted("Duplicate")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Edit")
  })

  test("on typeahead, highlight matching item", async () => {
    await I.clickTrigger()
    await I.type("E")
    await I.seeItemIsHighlighted("Edit")
    await I.type("E")
    await I.seeItemIsHighlighted("Export")
  })

  test("when closeOnSelect=false, stay open on selection", async () => {
    await I.controls.bool("closeOnSelect", false)
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.seeDropdown()
  })

  test("hover out, clear highlighted item", async () => {
    await I.clickViz()
    await I.clickTrigger()
    await I.hoverItem("Delete")
    await I.hoverOut()
    await I.dontSeeHighlightedItem()
  })

  test("with keyboard, can select item", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.dontSeeDropdown()
  })

  test("on click outside, close menu", async () => {
    await I.clickTrigger()
    await I.clickOutside()
    await I.dontSeeDropdown()
  })
})
