import { expect, type Locator, test } from "@playwright/test"
import { a11y, testid } from "./_utils"

const root = '[data-scope="checkbox"][data-part="root"]'
const input = testid("hidden-input")
const controlledInput = testid("controlled-hidden-input")

const expectNativeState = async (locator: Locator, state: { checked: boolean; indeterminate: boolean }) => {
  await expect(locator).toHaveJSProperty("checked", state.checked)
  await expect(locator).toHaveJSProperty("indeterminate", state.indeterminate)
}

test.describe("checkbox / indeterminate", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/checkbox/indeterminate")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("should sync the native input when initially indeterminate", async ({ page }) => {
    await expect(page.locator(root).first()).toHaveAttribute("data-state", "indeterminate")
    await expectNativeState(page.locator(input), { checked: false, indeterminate: true })
  })

  test("should sync the native input when initially indeterminate and controlled", async ({ page }) => {
    await expect(page.locator(root).last()).toHaveAttribute("data-state", "indeterminate")
    await expectNativeState(page.locator(controlledInput), { checked: false, indeterminate: true })
  })

  test("should clear indeterminate when clicked", async ({ page }) => {
    await expectNativeState(page.locator(input), { checked: false, indeterminate: true })
    await page.locator(root).first().click()
    await expect(page.locator(root).first()).toHaveAttribute("data-state", "checked")
    await expectNativeState(page.locator(input), { checked: true, indeterminate: false })
  })

  test("should restore indeterminate on form reset", async ({ page }) => {
    await expectNativeState(page.locator(input), { checked: false, indeterminate: true })
    await page.locator(root).first().click()
    await expectNativeState(page.locator(input), { checked: true, indeterminate: false })
    await page.click("button[type=reset]")
    await expect(page.locator(root).first()).toHaveAttribute("data-state", "indeterminate")
    await expectNativeState(page.locator(input), { checked: false, indeterminate: true })
  })
})
