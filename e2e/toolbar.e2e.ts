import { expect, test } from "@playwright/test"
import { ToolbarModel } from "./models/toolbar.model"

let I: ToolbarModel

test.describe("toolbar", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToolbarModel(page)
  })

  test("should have no accessibility violation", async () => {
    await I.goto("/toolbar/basic")
    await I.checkAccessibility()
  })

  test("[keyboard] focusing the toolbar redirects to the first item", async () => {
    await I.goto("/toolbar/basic")
    await I.focusRoot()
    await I.seeItemIsFocused("Align left")
  })

  test("[keyboard] arrow nav crosses group boundaries in one flat sequence", async () => {
    await I.goto("/toolbar/basic")
    await I.focusRoot()
    await I.seeItemIsFocused("Align left")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Align right")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Cut")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Copy")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Paste")
  })

  test("[keyboard] ArrowLeft moves backward and loops to the last item", async () => {
    await I.goto("/toolbar/basic")
    await I.focusRoot()
    await I.seeItemIsFocused("Align left")

    // Bubbles past the nested toggle-group's own boundary, wrapping to the toolbar's last item.
    await I.pressKey("ArrowLeft")
    await I.seeLinkIsFocused("Edited 51m ago")
  })

  test("[keyboard] Tab exits the whole toolbar as a single stop", async ({ page }) => {
    await I.goto("/toolbar/basic")
    await I.focusRoot()
    await I.pressKey("ArrowRight", 2)
    await I.seeItemIsFocused("Cut")

    await page.keyboard.press("Tab")
    await I.seeItemIsNotFocused("Cut")
  })

  test("[orientation] vertical toolbar uses ArrowUp/ArrowDown, ArrowLeft/Right are inert", async () => {
    await I.goto("/toolbar/orientation")
    await I.focusRoot()
    await I.seeItemIsFocused("Cut")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Cut")

    await I.pressKey("ArrowDown")
    await I.seeItemIsFocused("Copy")
  })

  test("[disabled] fully disabled item is skipped by arrow keys", async () => {
    await I.goto("/toolbar/disabled-items")
    await I.focusRoot()
    await I.seeItemIsFocused("Cut")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Paste")
  })

  test("[disabled] disabled-but-focusable item is reachable but does not activate", async ({ page }) => {
    await I.goto("/toolbar/disabled-items")
    await I.focusRoot()
    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Paste")

    await page.keyboard.press("Enter")
    await expect(page.getByText("Activated:")).toHaveText("Activated: (none)")
  })

  test("[rtl] ArrowLeft moves forward and ArrowRight moves backward", async () => {
    await I.goto("/toolbar/rtl")
    await I.focusRoot()
    await I.seeItemIsFocused("Cut")

    await I.pressKey("ArrowLeft")
    await I.seeItemIsFocused("Copy")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Cut")
  })

  test("[nested toggle-group] flat registry hands off at the nested group's boundary", async () => {
    await I.goto("/toolbar/basic")
    await I.focusRoot()
    await I.seeItemIsFocused("Align left")

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Align right")

    // one more step should hand off to the toolbar's own next item, not wrap
    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("Cut")
  })

  test("[with-menu] opening the menu suspends toolbar arrow nav; closing restores it", async ({ page }) => {
    await I.goto("/toolbar/with-menu")
    await I.focusRoot()
    await I.pressKey("ArrowLeft")
    await I.seeItemIsFocused("More actions")

    await page.keyboard.press("Enter")
    await expect(page.getByRole("menu")).toBeVisible()

    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("menuitem", { name: "Keyboard Shortcuts" })).toHaveAttribute("data-highlighted", "")

    await page.keyboard.press("Escape")
    await I.seeItemIsFocused("More actions")

    await I.pressKey("ArrowLeft")
    await I.seeItemIsFocused("Paste")
  })
})
