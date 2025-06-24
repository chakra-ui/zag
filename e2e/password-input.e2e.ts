import { test } from "@playwright/test"
import { PasswordInputModel } from "./models/password-input.model"

let I: PasswordInputModel

test.beforeEach(async ({ page }) => {
  I = new PasswordInputModel(page)
  await I.goto()
})

test("should have no accessibility violation", async () => {
  await I.checkAccessibility()
})

test("should toggle password visibility", async () => {
  await I.clickVisibilityTrigger()
  await I.canSeePassword()
  await I.clickVisibilityTrigger()
  await I.cantSeePassword()
})

test("preserve caret position when toggling password visibility", async () => {
  await I.input.pressSequentially("123456")
  await I.input.press("ArrowLeft")
  await I.clickVisibilityTrigger()
  await I.caretIsAt(5)
  await I.clickVisibilityTrigger()
  await I.caretIsAt(5)
})
