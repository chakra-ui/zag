import { expect, test } from "@playwright/test"
import { ListboxModel } from "./models/listbox.model"

let I: ListboxModel

test.describe("listbox", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("no highlighted item, arrow down", async () => {
    await I.tabToContent()
    await I.seeItemIsHighlighted("Andorra")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("United Arab Emirates")
  })

  test("no highlighted item, arrow up", async () => {
    await I.controls.bool("loopFocus", true)
    await I.tabToContent()
    await I.seeItemIsHighlighted("Andorra")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Zimbabwe")
  })

  test("should scroll selected option into view", async () => {
    await I.tabToContent()
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Zimbabwe")
    await I.seeItemInViewport("Zimbabwe")
  })

  test("[composition] controlled-ignore should keep selectedItems aligned with controlled value", async ({ page }) => {
    await I.goto("/listbox-controlled-ignore")
    await I.clickItem("Vue")

    const selectedItems = page.getByTestId("selected-items")
    await expect(selectedItems).toContainText("React")
    await expect(selectedItems).not.toContainText("Vue")
  })

  test("[composition] external value change should keep item selection in sync", async ({ page }) => {
    await I.goto("/listbox-external-value-change")
    await page.getByTestId("filter-vue-button").click()
    await page.getByTestId("set-solid-button").click()

    await expect(page.getByTestId("selected-items")).toContainText("Solid")
    await expect(page.locator("[data-part=item]", { hasText: "Solid" })).toHaveAttribute("data-state", "checked")
  })
})
