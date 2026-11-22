import { test } from "./_test"
import { AutocompleteModel } from "./models/autocomplete.model"

let I: AutocompleteModel

test.describe("autocomplete / mode", () => {
  test.beforeEach(async ({ page }) => {
    I = new AutocompleteModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("[list] filters and leaves the text alone", async () => {
    await I.seeInputMode("list")
    await I.type("ca")
    await I.dontSeeItem("Zambia")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Canada")
    await I.seeInputHasValue("ca")
  })

  test("[none] shows every item and leaves the text alone", async () => {
    await I.controls.select("mode", "none")
    await I.seeInputMode("none")
    await I.type("ca")
    await I.seeItem("Zambia")
    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("ca")
  })

  test("[both] completes the typed text with the first match", async () => {
    await I.controls.select("mode", "both")
    await I.seeInputMode("both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.seeInputSelection(2, 6)
    await I.seeItemIsHighlighted("Canada")
    await I.seeValue("ca")
    await I.dontSeeItem("Zambia")
  })

  test("[inline] completes the typed text and shows every item", async () => {
    await I.controls.select("mode", "inline")
    await I.seeInputMode("inline")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.seeInputSelection(2, 6)
    await I.seeItem("Zambia")
  })

  test("[both] typing replaces the completion and completes again", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.type("n")
    await I.seeInputHasValue("canada")
    await I.seeInputSelection(3, 6)
  })

  test("[both] keeps the typed casing", async () => {
    await I.controls.select("mode", "both")
    await I.type("cA")
    await I.seeInputHasValue("cAnada")
  })

  test("[both] backspace removes the completion, then deletes the text", async () => {
    await I.controls.select("mode", "both")
    await I.type("can")
    await I.seeInputHasValue("canada")
    await I.pressKey("Backspace")
    await I.seeInputHasValue("can")
    await I.dontSeeHighlightedItem()
    await I.pressKey("Backspace")
    await I.seeInputHasValue("ca")
  })

  test("[both] delete removes the completion", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("Delete")
    await I.seeInputHasValue("ca")
  })

  test("[both] end accepts the completion", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("End")
    await I.seeInputHasValue("Canada")
    await I.seeValue("Canada")
  })

  test("[both] arrow right accepts the completion", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("ArrowRight")
    await I.seeValue("Canada")
  })

  test("[both] enter chooses the completion", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Canada")
    await I.seeValue("Canada")
  })

  test("[both] escape restores the typed text", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("Escape")
    await I.seeInputHasValue("ca")
    await I.seeValue("ca")
  })

  test("[both] clicking outside keeps the completion", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.clickOutside()
    await I.seeValue("Canada")
  })

  test("[both] arrow keys show the highlighted item in the input", async () => {
    await I.controls.select("mode", "both")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("ArrowDown")
    await I.seeInputShowsHighlightedItem()
    await I.seeValue("ca")
  })

  test("[inline] arrow keys show the highlighted item in the input", async () => {
    await I.controls.select("mode", "inline")
    await I.type("ca")
    await I.seeInputHasValue("canada")
    await I.pressKey("ArrowDown")
    await I.seeInputShowsHighlightedItem()
  })

  test("[list] typing does not complete", async () => {
    await I.type("ca")
    await I.seeInputHasValue("ca")
    await I.dontSeeHighlightedItem()
  })
})

test.describe("autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    I = new AutocompleteModel(page)
    await I.goto()
  })

  test("[keyboard] Escape closes and keeps the typed text", async () => {
    await I.type("ca")
    await I.pressKey("ArrowDown")
    await I.pressKey("Escape")
    await I.dontSeeDropdown()
    await I.seeInputHasValue("ca")
    await I.seeValue("ca")
  })

  test("[keyboard] Enter on a suggestion fills it in without submitting", async () => {
    await I.type("ca")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.dontSeeDropdown()
    await I.seeValue("Canada")
    await I.seeSubmitted(null)
  })

  test("[keyboard] Enter with nothing highlighted submits the typed text", async () => {
    await I.type("zz")
    await I.pressKey("Enter")
    await I.seeSubmitted("zz")
  })

  test("[submitOnSelect] choosing a suggestion submits the form", async () => {
    await I.controls.bool("submitOnSelect")
    await I.type("ca")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.seeSubmitted("Canada")
  })

  test("[submitOnSelect] clicking a suggestion submits the form", async () => {
    await I.controls.bool("submitOnSelect")
    await I.type("ca")
    await I.clickItem("Canada")
    await I.seeSubmitted("Canada")
  })

  test("[keyboard] Tab closes the list and leaves in one press", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.pressKey("Tab")
    await I.dontSeeDropdown()
    await I.dontSeeInputIsFocused()
  })

  test("[pointer] clicking a suggestion fills it in and keeps focus", async () => {
    await I.type("ca")
    await I.clickItem("Canada")
    await I.seeValue("Canada")
    await I.dontSeeDropdown()
    await I.seeInputIsFocused()
  })

  test("[pointer] the clear trigger empties the text and keeps focus", async () => {
    await I.type("ca")
    await I.clickClearTrigger()
    await I.seeInputHasValue("")
    await I.seeInputIsFocused()
  })

  test("[keyboard] typing in the middle keeps the caret in place", async () => {
    await I.controls.select("mode", "both")
    await I.type("xyz")
    await I.pressKey("Home")
    await I.pressKey("ArrowRight")
    await I.type("a")
    await I.seeInputHasValue("xayz")
    await I.seeCaretAt(2)
  })

  test("[readOnly] does not complete or change the text", async () => {
    await I.controls.select("mode", "both")
    await I.controls.bool("readOnly")
    await I.seeInputMode("none")
    await I.type("ca")
    await I.seeInputHasValue("")
  })

  test("[disabled] does not open or take input", async () => {
    await I.controls.bool("disabled")
    await I.seeInputIsDisabled()
    await I.clickTrigger({ force: true })
    await I.dontSeeDropdown()
  })

  test("[required] blocks submitting an empty field", async () => {
    await I.controls.bool("required")
    await I.clickSubmit()
    await I.seeSubmitted(null)

    await I.type("ca")
    await I.clickSubmit()
    await I.seeSubmitted("ca")
  })
})
