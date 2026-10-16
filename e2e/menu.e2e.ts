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
    await I.seeDropdownIsFocused()
    await I.pressKey("ArrowDown", 2)
    await I.seeItemIsHighlighted("Duplicate")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Edit")
  })

  test("on typeahead, highlight matching item", async () => {
    await I.clickTrigger()
    await I.seeDropdownIsFocused()
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
    await I.seeDropdown()
    await I.seeDropdownIsFocused()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.dontSeeDropdown()
  })

  test("on click outside, close menu", async () => {
    await I.clickTrigger()
    await I.seeDropdownIsFocused()
    await I.clickOutside()
    await I.dontSeeDropdown()
  })

  test("click trigger to toggle menu", async () => {
    // click to open
    await I.clickTrigger()
    await I.seeDropdown()
    // click again to close
    await I.clickTrigger()
    await I.dontSeeDropdown()
    // click again to open
    await I.clickTrigger()
    await I.seeDropdown()
  })
})

test.describe("menu / overflow", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/menu/overflow")
  })

  test("on typeahead, keep highlight when scroll moves content under the cursor", async () => {
    await I.clickTrigger()
    await I.hoverItem("Item 5")
    await I.seeItemIsHighlighted("Item 5")
    await I.type("Z")
    await I.seeItemIsHighlighted("Zebra")
    await I.seeItemInViewport("Zebra")
  })

  test("on end key, keep highlight when scroll moves content under the cursor", async () => {
    await I.clickTrigger()
    await I.hoverItem("Item 5")
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Item 39")
    await I.seeItemInViewport("Item 39")
  })

  test("after keyboard scroll, hover still moves the highlight", async () => {
    await I.clickTrigger()
    await I.hoverItem("Item 5")
    await I.type("Z")
    await I.seeItemIsHighlighted("Zebra")
    await I.hoverItem("Item 23")
    await I.seeItemIsHighlighted("Item 23")
  })
})
