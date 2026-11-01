import { test } from "./_test"
import { GridListModel } from "./models/gridlist.model"

let I: GridListModel

test.describe("gridlist / grid keyboard", () => {
  test.beforeEach(async ({ page }) => {
    I = new GridListModel(page)
    await I.goto("/gridlist/grid")
  })

  test("should tab into the first item when nothing is selected", async () => {
    await I.tabIntoGrid()
    await I.seeItemIsFocused("apple")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("banana")

    await I.pressKey("ArrowDown")
    await I.seeItemIsFocused("lemon")
  })

  test("should tab back to the last focused item", async () => {
    await I.clickItem("lemon")
    await I.pressKey("Tab")
    await I.dontSeeItemIsFocused("lemon")

    await I.pressKey("Shift+Tab")
    await I.seeItemIsFocused("lemon")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("mango")
  })

  test("should tab into the selected item after the focus is lost", async () => {
    await I.clickItem("mango")
    await I.blurGrid()

    await I.tabIntoGrid()
    await I.seeItemIsFocused("mango")

    await I.pressKey("ArrowDown")
    await I.seeItemIsFocused("pineapple")
  })
})
