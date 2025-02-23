import { test } from "@playwright/test"
import { ToggleGroupModel } from "./models/toggle-group.model"

let I: ToggleGroupModel

test.describe("toggle-group", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToggleGroupModel(page)
    await page.goto("/toggle-group")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[single] should select on click", async () => {
    await I.clickItem("bold")
    await I.seeItemIsSelected(["bold"])

    await I.clickItem("italic")
    await I.seeItemIsSelected(["italic"])
    await I.seeItemIsNotSelected(["bold"])
  })

  test("[single] should select and deselect", async () => {
    await I.clickItem("bold")
    await I.seeItemIsSelected(["bold"])

    await I.clickItem("bold")
    await I.seeItemIsNotSelected(["bold"])
  })

  test("[multiple] should select multiple", async () => {
    await I.controls.bool("multiple", true)

    await I.clickItem("bold")
    await I.clickItem("italic")

    await I.seeItemIsSelected(["bold", "italic"])
  })

  test("[keyboard] when no toggle is selected, focus first toggle", async () => {
    // focus on outside button
    await I.clickOutsideButton()
    await I.pressKey("Tab")

    await I.seeItemIsFocused("bold")

    // shift tab back to outside button
    await I.pressKey("Shift+Tab")
    await I.seeItemIsNotFocused("bold")
    await I.seeOutsideButtonIsFocused()
  })

  test("[keyboard] in and out tab press", async () => {
    // focus on outside button
    await I.clickOutsideButton()
    await I.pressKey("Tab")
    await I.seeItemIsFocused("bold")

    // shift tab back to outside button
    await I.pressKey("Shift+Tab")
    await I.seeItemIsNotFocused("bold")
    await I.seeOutsideButtonIsFocused()

    // tab back to toggle
    await I.pressKey("Tab")
    await I.seeItemIsFocused("bold")

    // go right once
    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("italic")

    // shift tab back to outside button
    await I.pressKey("Shift+Tab")
    await I.seeItemIsNotFocused("italic")
    await I.seeOutsideButtonIsFocused()

    // tab back to toggle
    await I.pressKey("Tab")
    await I.seeItemIsFocused("italic")
  })

  test("[keyboard] focus loop", async () => {
    // focus on outside button
    await I.clickOutsideButton()
    await I.pressKey("Tab")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("italic")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("underline")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("bold")
  })
})
