import { test } from "./_test"
import { GridListModel } from "./models/gridlist.model"

let I: GridListModel

test.describe("gridlist / nested buttons", () => {
  test.beforeEach(async ({ page }) => {
    I = new GridListModel(page)
    await I.goto("/gridlist/basic")
  })

  test("clicking a button inside a row should not select the row", async () => {
    await I.clickItemButton("SENT", "Edit")
    await I.dontSeeItemIsSelected("SENT")
  })

  test("clicking the row itself should still select it", async () => {
    await I.clickItem("SENT")
    await I.seeItemIsSelected("SENT")
  })
})
