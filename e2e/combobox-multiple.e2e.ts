import { expect, test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / multiple", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/multiple")
  })

  test("should toggle the same item", async () => {
    await I.type("mal")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressKey("Enter")

    await I.seeValueText("Malawi")

    await I.pressKey("Enter")
    await I.dontSeeValueText()
  })

  test("deselecting with Enter keeps the highlight, and ArrowDown continues from it", async () => {
    await I.type("mal")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.seeItemIsChecked("Malawi")

    await I.pressKey("Enter")
    await I.seeItemIsNotChecked("Malawi")
    await I.seeItemIsHighlighted("Malawi")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malaysia")
  })

  test("[removeSelected=true] should not toggle the same item", async () => {
    await I.controls.bool("removeSelected", true)

    await I.type("mal")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressKey("Enter")

    await I.seeValueText("Malawi")

    await I.pressKey("Enter")
    await I.seeValueText("Malawi")
  })

  test("should expose the selected state of every option", async () => {
    await I.clickTrigger()
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")
    await I.pressKey("Enter")

    await I.seeItemIsSelected("Zambia")
    await I.seeItemIsNotSelected("Benin")
  })

  test("renders a hidden input per selected value", async ({ page }) => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")

    const values = await page
      .locator('input[type="hidden"][name="countries"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value))
    expect(values).toEqual(["ZA", "BN"])
  })
})
