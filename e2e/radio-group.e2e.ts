import { test } from "@playwright/test"
import { RadioGroupModel } from "./models/radio-group.model"

let I: RadioGroupModel

test.beforeEach(async ({ page }) => {
  I = new RadioGroupModel(page)
  await I.goto()
})

test("should have no accessibility violation", async () => {
  await I.checkAccessibility()
})

test("should have aria-labelledby on root", async () => {
  await I.seeRootHasLabelledBy()
})

test("should be checked when clicked", async () => {
  await I.clickRadio("apple")
  await I.seeRadioIsChecked("apple")

  await I.clickRadio("grape")
  await I.seeRadioIsChecked("grape")
})

test("should be focused when page is tabbed", async () => {
  await I.tabToFirstRadio()
  await I.seeRadioIsFocused("apple")
})

test("should be checked when spacebar is pressed while focused", async () => {
  await I.tabToFirstRadio()
  await I.pressKey(" ")
  await I.seeRadioIsChecked("apple")
})

test("should have disabled attributes when disabled", async () => {
  await I.controls.bool("disabled")
  await I.seeRadioIsDisabled("apple")
})

test("should not be focusable when disabled", async () => {
  await I.controls.bool("disabled")
  await I.seeRadioIsNotFocusable()
})

test("should be focused on active radio item when page is tabbed", async () => {
  await I.clickRadio("grape")
  await I.seeRadioIsChecked("grape")

  await I.tabToFirstRadio()
  await I.seeRadioIsFocused("grape")
})

test("should check items when navigating by arrows", async () => {
  await I.clickRadio("apple")
  await I.seeRadioIsChecked("apple")

  await I.pressKey("ArrowDown", 3)

  await I.seeRadioIsChecked("grape")
})

test("should keep data-focus-visible when navigating by arrows", async () => {
  await I.tabToFirstRadio()

  await I.seeRadioIsFocused("apple")
  await I.seeRadioIsFocusVisible("apple")

  await I.pressKey("ArrowDown", 3)

  await I.seeRadioIsFocused("grape")
  await I.seeRadioIsFocusVisible("grape")
})

test("should apply data-focus-visible after mouse click then arrow navigation", async () => {
  await I.clickRadio("apple")
  await I.seeRadioIsChecked("apple")

  // Initially focused via pointer, focus-visible should not be present
  await I.seeRadioIsNotFocusVisible("apple")

  await I.pressKey("ArrowDown", 3)

  await I.seeRadioIsFocused("grape")
  await I.seeRadioIsFocusVisible("grape")
})
