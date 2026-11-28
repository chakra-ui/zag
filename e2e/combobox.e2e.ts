import { expect, test } from "./_test"
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
    await I.seeInputIsFocused()
    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })

  test("[keyboard] typing scrolls the list back to the top", async () => {
    await I.clickTrigger()
    await I.seeDropdown()

    await I.scrollListToBottom()
    await I.seeListIsScrolled()

    await I.type("a")
    await I.seeListIsScrolledToTop()
  })

  test("[keyboard] should open combobox menu when typing", async () => {
    await I.focusInput()
    await I.type("c")
    await I.seeDropdown()
    await I.seeInputIsFocused()
    await I.type("an")
    await I.seeItemIsHighlighted("Canada")
    await I.seeInputIsFocused()

    await I.pressKey("Enter")
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

  test("[pointer] select and select again", async () => {
    await I.clickTrigger()

    await I.clickItem("Zambia")
    await I.seeInputHasValue("Zambia")

    await I.clickTrigger()
    await I.clickItem("Canada")

    await I.seeInputHasValue("Canada")
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
    await I.controls.bool("loopFocus", false)

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
    await I.controls.bool("loopFocus", false)

    await I.focusInput()
    await I.pressKey("ArrowUp")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / open] on home and end, when open, focus first and last option", async () => {
    await I.clickTrigger()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Canada")

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / open] on page down and up, move highlight by a page", async () => {
    await I.clickTrigger()
    await I.pressKey("Home")
    await I.seeItemAtIndexIsHighlighted(0)

    await I.pressKey("PageDown")
    await I.seeItemAtIndexIsHighlighted(10)

    await I.pressKey("PageUp")
    await I.seeItemAtIndexIsHighlighted(0)

    await I.pressKey("End")
    await I.pressKey("PageDown")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / closed] on home and end, caret moves to start and end", async () => {
    await I.controls.bool("allowCustomValue")
    await I.clickTrigger()
    await I.type("an")
    await I.seeInputHasValue("an")
    await I.pressKey("Escape")

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
    await I.controls.bool("loopFocus", false)

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
    await I.controls.bool("loopFocus", false)
    await I.type("mal")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[pointer / open-on-click]", async () => {
    await I.controls.bool("openOnClick", true)
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
    await I.controls.select("selectionBehavior", "clear")
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("")
  })

  test("[selection=replace] should show the chosen label", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")
  })

  test("[selection=preserve] should keep the typed text after choosing", async () => {
    await I.controls.select("selectionBehavior", "preserve")
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("mal")

    await I.clickOutside()
    await I.seeInputHasValue("mal")

    await I.clickTrigger()
    await I.seeItemIsChecked("Malawi")
  })

  test("[selection=preserve][multiple] should keep the text to choose several matches", async () => {
    await I.controls.bool("multiple")
    await I.controls.select("selectionBehavior", "preserve")
    await I.type("mal")
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")

    await I.seeInputHasValue("mal")
    await I.seeItemIsChecked("Malawi")
    await I.seeItemIsChecked("Malaysia")
  })

  test("[selection=clear][multiple] should clear the text after each choice", async () => {
    await I.controls.bool("multiple")
    await I.controls.select("selectionBehavior", "clear")
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("")
  })

  test("[disabled] should not open or take input", async () => {
    await I.controls.bool("disabled")
    await I.seeInputIsDisabled()
    await I.clickTrigger({ force: true })
    await I.dontSeeDropdown()
  })

  test("[readOnly] should not open or change the text", async () => {
    await I.controls.bool("readOnly")
    await I.seeInputIsReadOnly()
    await I.focusInput()
    await I.type("mal")
    await I.seeInputHasValue("")
    await I.pressKey("ArrowDown")
    await I.dontSeeDropdown()
  })

  test("[keyboard] emptying the text clears the value", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeOnValueChangeItems("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.pressKey("Backspace")
    await I.seeOnValueChangeItemsIsEmpty()
  })

  test("[keyboard] Escape brings back the value emptying the text cleared", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.pressKey("Backspace")
    await I.seeOnValueChangeItemsIsEmpty()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
    await I.seeInputHasValue("Malawi")
    await I.seeOnValueChangeItems("Malawi")
  })

  test("[keyboard] Escape brings back the value after emptying and typing again", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.pressKey("Backspace")
    await I.type("zam")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("Escape")
    await I.seeInputHasValue("Malawi")
    await I.seeOnValueChangeItems("Malawi")
  })

  test("[keyboard] Escape restores the chosen label over typed text in one press", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.type("zzz")
    await I.seeDropdown()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
    await I.seeInputHasValue("Malawi")
  })

  test("[pointer] clicking outside after emptying the text keeps it empty", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.pressKey("Backspace")
    await I.seeDropdown()

    await I.closeByClickingOutside()
    await I.seeInputHasValue("")
    await I.seeOnValueChangeItemsIsEmpty()
  })

  test("[keyboard] Tab closes the list without choosing", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.type("mal")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")

    await I.pressKey("Tab")
    await I.dontSeeDropdown()
    await I.seeInputHasValue("")
  })

  test("[keyboard] Tab leaves in one press when the list scrolls, keeping emptied text empty", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.pressKey("Backspace")
    await I.seeOnValueChangeItemsIsEmpty()
    await I.seeDropdown()

    await I.pressKey("Tab")
    await I.dontSeeDropdown()
    await I.dontSeeInputIsFocused()
    await I.seeInputHasValue("")
  })

  test("[pointer] clicking outside reverts unmatched text", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.type("zzz")
    await I.seeDropdown()
    await I.closeByClickingOutside()
    await I.seeInputHasValue("Malawi")
  })

  test("[pointer] the trigger closes an open list", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.clickTrigger()
    await I.dontSeeDropdown()
  })

  test("[pointer] clicking the label focuses the input without opening", async () => {
    await I.clickLabel()
    await I.seeInputIsFocused()
    await I.dontSeeDropdown()
  })

  test("reopening after a choice shows every item with the choice highlighted", async () => {
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")

    await I.clickTrigger()
    await I.seeItem("Zambia")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[a11y] aria-activedescendant follows the highlight after filtering", async () => {
    await I.type("mal")
    await I.seeItemIsHighlighted("Malawi")
    await I.seeActiveDescendantIsHighlighted()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malaysia")
    await I.seeActiveDescendantIsHighlighted()
  })

  test("[callback] onValueChange should include selected item in items", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")
  })

  test("[callback] onValueChange items should be empty after clearing", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")
    await I.clickTrigger()
    await I.clickClearTrigger()
    await I.seeOnValueChangeItemsIsEmpty()
  })

  test("[callback] onValueChange items should track latest selected item", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")

    await I.clickTrigger()
    await I.clickItem("Canada")
    await I.seeOnValueChangeItems("Canada")
    await expect(I.valueChangeText).not.toContainText("Zambia")
  })

  test("[no value] enter behavior for custom values", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.type("foo")
    await I.pressKey("Enter")
    await I.seeInputHasValue("")
  })

  test("[value] enter reverts the value", async () => {
    await I.controls.bool("autoHighlight", false)
    await I.type("mal")
    await I.clickItem("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.type("foo")
    await I.pressKey("Enter")

    await I.seeInputHasValue("Malawi")
  })
})

test.describe("combobox / scroll under resting cursor", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto()
  })

  test("on end key, keep highlight when scroll moves content under the cursor", async () => {
    await I.clickTrigger()
    await I.hoverItem("Canada")
    await I.seeItemIsHighlighted("Canada")
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Tunisia")
    await I.seeItemInViewport("Tunisia")
  })

  test("after keyboard scroll, hover still moves the highlight", async () => {
    await I.clickTrigger()
    await I.hoverItem("Canada")
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Tunisia")
    await I.hoverItem("Tonga")
    await I.seeItemIsHighlighted("Tonga")
  })
})

test.describe("combobox [highlight frame]", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await page.clock.install()
    await I.goto()
    const now = await page.evaluate(() => Date.now())
    await page.clock.pauseAt(now + 60_000)
  })

  test("Escape right after ArrowDown should not leave a highlighted item", async ({ page }) => {
    await I.focusInput()
    await I.seeInputIsFocused()

    await I.pressKey("ArrowDown")
    await I.pressKey("Escape")
    await page.clock.runFor(32)

    await I.dontSeeDropdown()
    await I.dontSeeHighlightedItem()
  })
})

test.describe("inline list without content", () => {
  test("[keyboard] Enter right after typing selects the first match", async ({ page }) => {
    await page.goto("/combobox/inline-list")
    const input = page.getByTestId("input")
    await input.focus()

    // hold animation frames so the keys land before the next one, like a fast typist
    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0
    })
    await page.keyboard.insertText("Japan")
    await page.keyboard.press("Enter")

    await expect(page.getByTestId("selected")).toHaveText("Selected: Japan")
  })
})
