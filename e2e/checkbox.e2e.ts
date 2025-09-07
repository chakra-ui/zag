import { expect, test } from "@playwright/test"
import { CheckboxModel } from "./models/checkbox.model"

let I: CheckboxModel

test.beforeEach(async ({ page }) => {
  I = new CheckboxModel(page)
  await I.goto()
})

test("should have no accessibility violation", async () => {
  await I.checkAccessibility()
})

test("should be checked when clicked", async () => {
  await I.root.click()
  await I.expectToBeChecked()
})

test("should be focused when page is tabbed", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(I.input).toBeFocused()
  await expect(I.control).toHaveAttribute("data-focus", "")
})

test("should be checked when spacebar is pressed while focused", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.keyboard.press(" ")
  await I.expectToBeChecked()
})

test("should have disabled attributes when disabled", async () => {
  await I.controls.bool("disabled")
  await I.expectToBeDisabled()
})

test("should not be focusable when disabled", async ({ page }) => {
  await I.controls.bool("disabled")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(I.input).not.toBeFocused()
})

test("input is not blurred on label click", async ({ page }) => {
  let blurCount = 0
  await page.exposeFunction("trackBlur", () => blurCount++)
  await I.input.evaluate((input) => {
    input.addEventListener("blur", (window as any).trackBlur)
  })
  await I.label.click()
  await I.label.click()
  await I.label.click()
  expect(blurCount).toBe(0)
})
