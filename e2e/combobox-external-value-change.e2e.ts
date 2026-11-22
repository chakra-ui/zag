import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / external value change", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/external-value-change")
  })

  test("should keep item selection in sync", async () => {
    await I.clickInput()
    await I.type("vu")
    await I.seeDropdown()

    await I.pressKey("Escape")
    await I.clickButton("Set to Solid")
    await I.seeInputHasValue("Solid")
    await I.clickTrigger()
    await I.seeItemIsChecked("Solid")
  })
})
