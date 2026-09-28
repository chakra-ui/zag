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

    await I.hoverItem("Zambia")
    await I.seeItemIsHighlighted("Zambia")
  })

  test("[range] shift+click anchors on the last clicked item, not the hovered one", async () => {
    await I.controls.select("selectionMode", "multiple")
    await I.clickItem({ value: "AD" })

    // moving the pointer to the target necessarily hovers the items in between
    await I.hoverItem({ value: "AE" })
    await I.hoverItem({ value: "AF" })
    await I.hoverItem({ value: "AG" })

    await I.clickItem({ value: "AG" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF", "AG"])
  })

  test("[range] successive shift+clicks extend from the original anchor", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.clickItem({ value: "AI" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF", "AG", "AI"])

    await I.clickItem({ value: "AF" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF"])
  })

  test("[range] hovering between two shift+clicks does not move the anchor", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })
    await I.clickItem({ value: "AI" }, { modifiers: ["Shift"] })

    await I.hoverItem({ value: "AM" })

    await I.clickItem({ value: "AF" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF"])
  })

  test("[range] meta+click moves the anchor for the next range", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })
    await I.clickItem({ value: "AG" }, { modifiers: ["ControlOrMeta"] })

    await I.clickItem({ value: "AL" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AG", "AI", "AL"])
  })

  test("[range] shift+arrow can reverse direction", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.pressKey("Shift+ArrowDown", 2)
    await I.seeSelectedValues(["AD", "AE", "AF"])

    await I.pressKey("Shift+ArrowUp")
    await I.seeSelectedValues(["AD", "AE"])

    await I.pressKey("Shift+ArrowUp")
    await I.seeSelectedValues(["AD"])
  })

  test("[range] plain arrow re-anchors without dropping the selection", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.pressKey("ArrowDown")
    await I.pressKey("Shift+ArrowDown")

    await I.seeSelectedValues(["AD", "AE", "AF"])
  })

  test("[range] select all then shift+click extends from the last clicked item", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.pressKey("ControlOrMeta+a")
    await I.clickItem({ value: "AG" }, { modifiers: ["Shift"] })

    await I.seeSelectedValues(["AD", "AE", "AF", "AG"])
  })

  test("[range] clearing the selection keeps the anchor", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.pressKey("Escape")
    await I.seeSelectedValues([])

    await I.clickItem({ value: "AG" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF", "AG"])
  })

  test("[range] typeahead moves the highlight without moving the anchor", async () => {
    await I.controls.select("selectionMode", "extended")
    await I.clickItem({ value: "AD" })

    await I.type("united")
    await I.seeItemIsHighlighted("United Kingdom")

    // the range still starts at the clicked item, not the item typeahead jumped to
    await I.clickItem({ value: "AF" }, { modifiers: ["Shift"] })
    await I.seeSelectedValues(["AD", "AE", "AF"])
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
    await expect(page.locator("[data-part=item]", { hasText: "Solid" })).toHaveAttribute("data-state", "checked")
  })
})
