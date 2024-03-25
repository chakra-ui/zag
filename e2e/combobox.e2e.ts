import { test } from "@playwright/test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("[pointer] should open combobox menu when arrow is clicked", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.seeInputIsFocused()
  })

  test("[keyboard] Escape should close content", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.pressEsc()
    await I.dontSeeDropdown()
  })

  test("[typeahead / autohighlight / selection] should open combobox menu when typing", async () => {
    await I.type("an")
    await I.seeDropdown()
    await I.seeItemIsHighlighted("Canada")

    await I.pressEnter()
    await I.seeInputHasValue("Canada")
    await I.dontSeeDropdown()
  })

  test("[pointer / selection]", async () => {
    await I.clickTrigger()

    await I.hoverItem("Zambia")
    await I.seeItemIsHighlighted("Zambia")

    await I.clickItem("Zambia")
    await I.seeInputHasValue("Zambia")
    await I.dontSeeDropdown()
  })

  test("[keyboard / loop] on arrow down, open and highlight first enabled option", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / no-loop] on arrow down, open and highlight first enabled option", async () => {
    await I.setContext.bool("loop", false)

    await I.focusInput()
    await I.pressKey("ArrowDown")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Zambia")
  })

  test("[keyboard / loop] on arrow up, open and highlight last enabled option", async () => {
    await I.focusInput()
    await I.pressKey("ArrowUp")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / no-loop] on arrow up, open and highlight last enabled option", async () => {
    await I.setContext.bool("loop", false)

    await I.focusInput()
    await I.pressKey("ArrowUp")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / opened] on home and end, when open, focus first and last option", async () => {
    await I.clickTrigger()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Canada")

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / closed] on home and end, caret moves to start and end", async () => {
    await I.clickTrigger()
    await I.type("an")
    await I.pressEsc()

    await I.pressKey("Home")
    await I.seeCaretAt(0)

    await I.pressKey("End")
    await I.seeCaretAt(2)
  })

  test("[keyboard / arrowdown / loop]", async () => {
    await I.type("mal")

    await I.pressKey("ArrowDown", 4)
    await I.seeItemIsHighlighted("Malta")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[keyboard / arrowdown / no-loop]", async () => {
    await I.setContext.bool("loop", false)

    await I.type("mal")
    await I.pressKey("ArrowDown", 4)
    await I.seeItemIsHighlighted("Malta")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malta")
  })

  test("[keyboard / arrowup / loop]", async () => {
    await I.type("mal")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Malta")
  })

  test("[keyboard / arrowup / no-loop]", async () => {
    await I.setContext.bool("loop", false)
    await I.type("mal")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[pointer / open-on-click]", async () => {
    await I.setContext.bool("openOnClick", true)
    await I.clickInput()
    await I.seeDropdown()
  })

  test("selects value on click", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeItemIsChecked("Zambia")
  })

  test("can clear value", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.clickTrigger()
    await I.clickClearTrigger()
    await I.seeInputHasValue("")
    await I.seeItemIsNotChecked("Zambia")
  })

  test("should scroll selected option into view", async () => {
    await I.clickTrigger()
    await I.clickItem("Malta")
    await I.clickTrigger()
    await I.seeItemIsHighlighted("Malta")
    await I.seeItemInViewport("Malta")
  })

  test("[selection=clear] should clear input value", async () => {
    await I.setContext.select("selectionBehavior", "clear")
    await I.type("mal")
    await I.pressEnter()
    await I.seeInputHasValue("")
  })
})

test.describe("combobox / autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto()
    await I.setContext.select("inputBehavior", "autocomplete")
  })

  test("[keyboard] should autocomplete", async () => {
    await I.type("mal")
    await I.dontSeeHighlightedItem()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressEnter()
    await I.seeInputHasValue("Malawi")
    await I.dontSeeDropdown()
  })

  test("[keyboard / loop] should loop through the options and previous input value", async () => {
    await I.type("mal")
    await I.pressKey("ArrowDown", 5)
    await I.seeItemIsHighlighted("Malta")

    // at the end of the list, press arrow down to return to previous input value
    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("mal")

    // no option should be selected
    await I.dontSeeHighlightedItem()
  })

  test("[pointer] hovering an option should not update input value", async () => {
    await I.clickTrigger()
    await I.type("mal")

    await I.hoverItem("Malawi")
    await I.seeInputHasValue("mal")
  })
})
