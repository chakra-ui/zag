import { expect, test } from "@playwright/test"
import { ToggleGroupModel } from "./models/toggle-group.model"

let I: ToggleGroupModel

test.describe("toggle-group", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToggleGroupModel(page)
    await page.goto("/toggle-group/basic")
    await page.waitForLoadState("networkidle")
    await expect(I.root).toBeVisible()
    await expect(I.getItem("bold")).toHaveAttribute("aria-pressed", "false")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should expose toggle button semantics", async ({ page }) => {
    await I.controls.bool("multiple", false)
    await I.clickItem("bold")

    await I.seeItemIsPressed(["bold"])

    await expect(I.root).toHaveAttribute("role", "group")
    await expect(I.root).not.toHaveAttribute("role", "radiogroup")
    await expect(page.getByRole("radio")).toHaveCount(0)
  })

  test("[single] should select on click", async () => {
    await I.clickItem("bold")
    await I.seeItemIsPressed(["bold"])

    await I.clickItem("italic")
    await I.seeItemIsPressed(["italic"])
    await I.seeItemIsNotPressed(["bold"])
  })

  test("[single] should select and deselect", async () => {
    await I.clickItem("bold")
    await I.seeItemIsPressed(["bold"])

    await I.clickItem("bold")
    await I.seeItemIsNotPressed(["bold"])
  })

  test("[multiple] should select multiple", async () => {
    await I.controls.bool("multiple", true)

    await I.clickItem("bold")
    await I.clickItem("italic")

    await I.seeItemIsPressed(["bold", "italic"])
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
    await I.seeItemIsFocused("bold")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("italic")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("underline")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("bold")
  })
})
