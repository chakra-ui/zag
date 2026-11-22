import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / form", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/form")
  })

  test("[keyboard] Enter on highlighted item selects and does not submit form", async () => {
    await I.controls.bool("autoHighlight", false)

    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")
    await I.dontSeeDropdown()
    await I.seeSubmitCount(0)
  })

  test("[no highlight / rejected value] Enter does not submit when typed value won't be accepted", async () => {
    await I.controls.bool("autoHighlight", false)

    await I.focusInput()
    await I.type("z")
    await I.seeDropdown()
    await I.dontSeeHighlightedItem()

    await I.pressKey("Enter")
    await I.seeSubmitCount(0)
  })

  test("[autoHighlight] Enter selects auto-highlighted item and does not submit", async () => {
    await I.controls.bool("autoHighlight", true)

    await I.focusInput()
    await I.type("z")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")
    await I.seeSubmitCount(0)
  })

  test("[allowCustomValue + highlight] Enter selects highlighted item and does not submit", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.controls.bool("allowCustomValue", true)

    await I.focusInput()
    await I.type("z")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")
    await I.seeSubmitCount(0)
  })

  test("[allowCustomValue] Enter submits custom value on first press", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.controls.bool("allowCustomValue", true)

    await I.focusInput()
    await I.type("my custom country")
    await I.dontSeeHighlightedItem()

    await I.pressKey("Enter")
    await I.seeSubmitCount(1)
    await I.seeLastSubmit("my custom country")
  })

  test("submits the selected item's value, not its label", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")

    await I.clickSubmit()
    await I.seeLastSubmit("ZA")
  })

  test("[required] blocks submitting until an item is chosen", async () => {
    await I.controls.bool("required")
    await I.clickSubmit()
    await I.seeSubmitCount(0)

    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")
    await I.clickSubmit()
    await I.seeSubmitCount(1)
  })

  test("[allowCustomValue] submits typed text over a previous selection", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.controls.bool("allowCustomValue", true)

    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Zambia")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Zambia")

    await I.fillInput("Atlantis")
    await I.pressKey("Enter")
    await I.seeLastSubmit("Atlantis")
  })
})
