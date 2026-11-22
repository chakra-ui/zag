import { expect, test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / chips", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/chips")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should render a chip per selected item", async () => {
    await I.seeChips(["United States", "Canada"])

    await I.type("nig")
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")

    await I.seeChips(["United States", "Canada", "Nigeria"])
    await I.seeInputHasValue("")
  })

  test("ArrowLeft at the start of the input should move into the chips", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.seeChipIsFocused("Canada")

    await I.pressKey("ArrowLeft")
    await I.seeChipIsFocused("United States")

    // stays on the first chip
    await I.pressKey("ArrowLeft")
    await I.seeChipIsFocused("United States")

    await I.pressKey("ArrowRight")
    await I.seeChipIsFocused("Canada")

    await I.pressKey("ArrowRight")
    await I.seeInputIsFocused()
  })

  test("ArrowLeft should move the caret before moving into the chips", async () => {
    await I.type("ca")

    await I.pressKey("ArrowLeft")
    await I.seeInputIsFocused()
    await I.seeCaretAt(1)

    await I.pressKey("ArrowLeft")
    await I.seeInputIsFocused()
    await I.seeCaretAt(0)

    await I.pressKey("ArrowLeft")
    await I.seeChipIsFocused("Canada")
    await I.seeInputHasValue("ca")
  })

  test("Home and End should move to the first and last chip", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("Home")
    await I.seeChipIsFocused("United States")

    await I.pressKey("End")
    await I.seeChipIsFocused("Canada")
  })

  test("Backspace on a chip should delete it and focus the previous chip", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("Backspace")

    await I.seeChips(["United States"])
    await I.seeChipIsFocused("United States")

    // deleting the last chip returns focus to the input
    await I.pressKey("Backspace")
    await I.seeChips([])
    await I.seeInputIsFocused()
  })

  test("Delete on a chip should delete it and focus the next chip", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft", 2)
    await I.pressKey("Delete")

    await I.seeChips(["Canada"])
    await I.seeChipIsFocused("Canada")
  })

  test("Backspace in an empty input should focus the last chip, then delete it", async () => {
    await I.focusInput()
    await I.pressKey("Backspace")

    await I.seeChips(["United States", "Canada"])
    await I.seeChipIsFocused("Canada")

    await I.pressKey("Backspace")
    await I.seeChips(["United States"])
    await I.seeChipIsFocused("United States")
  })

  test("deleting a chip should announce it", async () => {
    await I.clickChipDeleteTrigger("Canada")
    await I.seeChips(["United States"])
    await expect(I.liveRegion("polite")).toContainText("Canada deleted")
  })

  test("Backspace in an input with text should edit the text", async () => {
    await I.type("ca")
    await I.pressKey("Backspace")

    await I.seeInputHasValue("c")
    await I.seeChips(["United States", "Canada"])
  })

  test("clicking a delete trigger should delete its chip", async () => {
    await I.clickChipDeleteTrigger("United States")

    await I.seeChips(["Canada"])
    await I.seeInputIsFocused()
  })

  test("typing on a chip should type into the input", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("j")

    await I.seeInputIsFocused()
    await I.seeInputHasValue("j")
  })

  test("Escape on a chip should return to the input", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("Escape")

    await I.seeInputIsFocused()
    await I.seeChips(["United States", "Canada"])
  })

  test("pressing the space around the chips should focus the input", async () => {
    await I.clickChipGroupSpace()
    await I.seeInputIsFocused()
  })

  test("ArrowDown on a chip should open the list", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("ArrowDown")

    await I.seeInputIsFocused()
    await I.seeDropdown()
  })
})
