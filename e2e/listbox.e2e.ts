import { expect, test } from "./_test"
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

  test("[rtl] grid arrow keys should be mirrored", async () => {
    await I.goto("/listbox/grid")
    await I.clickControls()
    await I.controls.select("dir", "rtl")
    await I.tabToContent()
    await I.seeItemIsHighlighted("Oleg Chursin")
    await I.pressKey("ArrowLeft")
    await I.seeItemIsHighlighted("Christopher Sardegna")
    await I.pressKey("ArrowRight")
    await I.seeItemIsHighlighted("Oleg Chursin")
  })

  test("typeahead: lowercase a should move the highlight to matching item", async () => {
    await I.tabToContent()
    await I.seeItemIsHighlighted("Andorra")

    await I.type("a")
    await I.seeItemIsHighlighted("Afghanistan")
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
    await expect(page.locator("[data-listbox-item]", { hasText: "Solid" })).toHaveAttribute("data-state", "checked")
  })
})

test.describe("listbox / horizontal", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/horizontal")
  })

  test("arrow left/right move the highlight", async () => {
    await I.list.focus()
    await I.pressKey("ArrowRight")
    await I.seeItemIsHighlighted("Free parking")
    await I.pressKey("ArrowLeft")
    await I.seeItemIsHighlighted("Wi-Fi")
  })

  test("space toggles items without clearing others", async () => {
    await I.list.focus()
    await I.pressKey("ArrowRight", 2)
    await I.pressKey(" ")
    await I.seeSelectedValues(["wifi", "pool", "breakfast"])
  })
})

test.describe("listbox / disabled item", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/disabled-item")
  })

  test("arrow keys skip the disabled item", async () => {
    await I.list.focus()
    await I.seeItemIsHighlighted("Standard")
    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Store pickup")
  })

  test("clicking the disabled item doesn't select it", async () => {
    await I.getItem("Same day").click({ force: true })
    await I.seeSelectedValues(["standard"])
  })
})

test.describe("listbox / select all", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/select-all")
  })

  test("select all and clear", async ({ page }) => {
    await page.getByRole("button", { name: "Select all" }).click()
    await expect(page.getByTestId("value-text")).toHaveText("6 of 6 selected")
    await page.getByRole("button", { name: "Clear" }).click()
    await expect(page.getByTestId("value-text")).toHaveText("0 of 6 selected")
    await I.seeSelectedValues([])
  })
})

test.describe("listbox / selection follows focus", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/selection-follows-focus")
  })

  test("arrow keys select as they move", async ({ page }) => {
    await I.list.focus()
    await I.pressKey("ArrowRight")
    await I.seeSelectedValues(["month"])
    await expect(page.getByTestId("preview")).toHaveText("Showing the month view")
    await I.pressKey("ArrowLeft", 2)
    await I.seeSelectedValues(["day"])
  })
})

test.describe("listbox / group", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/group")
  })

  test("arrow keys move across groups", async () => {
    await I.list.focus()
    await I.seeItemIsHighlighted("London")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("São Paulo")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })
})

// Grouped order: Fruit (Apple, Apricot, Banana, Cherry), Vegetable (Avocado, Asparagus, Broccoli, Carrot, Celery*)
test.describe("listbox / grouped", () => {
  test.beforeEach(async ({ page }) => {
    I = new ListboxModel(page)
    await I.goto("/listbox/grouped")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should navigate in grouped order", async () => {
    await I.tabToContent()
    await I.seeItemIsHighlighted("Apple")

    for (const item of ["Apricot", "Banana", "Cherry", "Avocado"]) {
      await I.pressKey("ArrowDown")
      await I.seeItemIsHighlighted(item)
    }

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Carrot")
  })

  test("should cycle typeahead matches in grouped order", async () => {
    await I.tabToContent()
    await I.seeItemIsHighlighted("Apple")
    for (const item of ["Apricot", "Avocado", "Asparagus", "Apple"]) {
      await I.type("a")
      await I.seeItemIsHighlighted(item)
    }
  })

  // Rows: [Apple, Apricot] [Banana, Cherry] [Avocado, Asparagus] [Broccoli, Carrot] [Celery*]
  test("[grid] should navigate rows in grouped order", async () => {
    await I.goto("/listbox/grouped-grid")
    await I.tabToContent()
    await I.seeItemIsHighlighted("Apple")

    const steps: Array<[string, string]> = [
      ["ArrowRight", "Apricot"],
      ["ArrowDown", "Cherry"],
      ["ArrowDown", "Asparagus"],
      ["ArrowLeft", "Avocado"],
      ["ArrowDown", "Broccoli"],
      ["ArrowUp", "Avocado"],
    ]
    for (const [key, item] of steps) {
      await I.pressKey(key)
      await I.seeItemIsHighlighted(item)
    }
  })
})
