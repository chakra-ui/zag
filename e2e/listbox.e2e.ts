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

  test("should keep keyboard highlight when content scrolls under a resting pointer", async ({ page }) => {
    await I.tabToContent()

    const box = await I.getItem("Afghanistan").boundingBox()
    if (!box) throw new Error("Expected Afghanistan item to be visible")
    const x = Math.round(box.x + box.width / 2)
    const y = Math.round(box.y + box.height / 2)

    await page.mouse.move(x, y)
    await I.seeItemIsHighlighted("Afghanistan")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Zimbabwe")

    // WebKit emits a move at the unchanged position when content scrolls under a resting cursor
    await page.mouse.move(x, y)
    await I.seeItemIsHighlighted("Zimbabwe")

    await I.getItem("Zambia").hover()
    await I.seeItemIsHighlighted("Zambia")
  })

  test("[composition] controlled-ignore should keep selectedItems aligned with controlled value", async ({ page }) => {
    await I.goto("/listbox/controlled-ignore")
    await I.clickItem("Vue")

    const selectedItems = page.getByTestId("selected-items")
    await expect(selectedItems).toContainText("React")
    await expect(selectedItems).not.toContainText("Vue")
  })

  test("[composition] external value change should keep item selection in sync", async ({ page }) => {
    await I.goto("/listbox/external-value-change")
    await page.getByTestId("filter-vue-button").click()
    await page.getByTestId("set-solid-button").click()

    await expect(page.getByTestId("selected-items")).toContainText("Solid")
    await expect(page.locator("[data-listbox-item]", { hasText: "Solid" })).toHaveAttribute("data-state", "checked")
  })
})
