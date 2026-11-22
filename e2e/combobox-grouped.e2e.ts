import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / grouped", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/grouped")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should navigate in grouped order", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Apple")

    for (const item of ["Apricot", "Banana", "Cherry", "Avocado"]) {
      await I.pressKey("ArrowDown")
      await I.seeItemIsHighlighted(item)
    }
  })

  test("arrow keys skip a disabled item", async () => {
    // "c" shows Avocado, Broccoli, Carrot, the disabled Celery, then Apricot and Cherry
    await I.type("c")
    await I.seeItemIsHighlighted("Avocado")
    await I.pressKey("ArrowDown", 2)
    await I.seeItemIsHighlighted("Carrot")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Apricot")
  })

  test("hovering a disabled item keeps the highlight", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Apple")
    await I.hoverItem("Celery")
    await I.seeItemIsHighlighted("Apple")
  })

  test("clicking a disabled item does not choose it", async () => {
    await I.clickTrigger()
    await I.clickItem("Celery", { force: true })
    await I.seeDropdown()
    await I.seeInputHasValue("")
  })

  test("should navigate filtered items in grouped order", async () => {
    // "o" matches Avocado, Apricot, Broccoli, Carrot in source order.
    // Groups follow first appearance, so Vegetable comes first
    await I.type("o")
    await I.seeItemIsHighlighted("Avocado")
    for (const item of ["Broccoli", "Carrot", "Apricot"]) {
      await I.pressKey("ArrowDown")
      await I.seeItemIsHighlighted(item)
    }
  })
})
