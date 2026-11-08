import { test } from "./_test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("menu / virtualized", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/menu/virtualized")
    await I.focusTrigger()
    await I.pressKey("Enter")
    // Opening highlights the first item; wait for it before pressing more keys
    await I.seeHighlightedItemText("Item 0")
  })

  test("arrow keys reach items below the rendered rows", async () => {
    await I.pressKey("ArrowDown", 20)
    await I.seeHighlightedItemText("Item 20")
    await I.seeHighlightedItemInViewport()
  })

  test("End and Home reach the ends of the list", async () => {
    await I.pressKey("End")
    await I.seeHighlightedItemText("Item 999")
    await I.seeHighlightedItemInViewport()

    await I.pressKey("Home")
    await I.seeHighlightedItemText("Item 0")
    await I.seeHighlightedItemInViewport()
  })

  test("typeahead finds an item that isn't rendered", async () => {
    await I.type("Item 500")
    await I.seeHighlightedItemText("Item 500")
    await I.seeHighlightedItemInViewport()
  })

  test("selects an item reached with the keyboard", async () => {
    await I.pressKey("End")
    await I.pressKey("ArrowUp")
    await I.pressKey("Enter")
    await I.seeSelectedValue("item-998")
  })
})
