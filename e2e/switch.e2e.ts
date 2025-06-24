import { test } from "@playwright/test"
import { SwitchModel } from "./models/switch.model"

let I: SwitchModel

test.beforeEach(async ({ page }) => {
  I = new SwitchModel(page)
  await I.goto()
})

test("should have no accessibility violation", async () => {
  await I.checkAccessibility()
})

test("should be checked when clicked", async () => {
  await I.clickCheckbox()
  await I.seeCheckboxIsChecked()
})

test("should be focused when page is tabbed", async () => {
  await I.focusCheckbox()
  await I.seeCheckboxIsFocused()
})

test("should be checked when spacebar is pressed while focused", async () => {
  await I.focusCheckbox()
  await I.pressKey(" ")
  await I.seeCheckboxIsChecked()
})

test("should have disabled attributes when disabled", async () => {
  await I.controls.bool("disabled", true)
  await I.seeCheckboxIsDisabled()
})

test("should not be focusable when disabled", async () => {
  await I.controls.bool("disabled", true)
  await I.clickLabel()
  await I.seeCheckboxIsNotFocused()
})

test("input is not blurred on label click", async () => {
  await I.trackBlur()
  await I.clickLabel(3)
  await I.expectBlurCount(0)
})
