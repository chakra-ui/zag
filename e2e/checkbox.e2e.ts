import { expect, type Page, test } from "@playwright/test"
import { a11y, controls, part, testid } from "./_utils"

const root = part("root")
const label = part("label")
const control = part("control")
const input = testid("hidden-input")

const expectLabelText = async (page: Page, expected: string) => {
  const labelLocator = page.locator(part("label"))
  await expect(labelLocator).toHaveText(new RegExp(expected, "i"))
}

const expectToBeChecked = async (page: Page) => {
  await expect(page.locator(root)).toHaveAttribute("data-state", "checked")
  await expect(page.locator(label)).toHaveAttribute("data-state", "checked")
  await expect(page.locator(control)).toHaveAttribute("data-state", "checked")
  await expectLabelText(page, "Checked")
}

const expectToBeIndeterminate = async (page: Page) => {
  await expect(page.locator(root)).toHaveAttribute("data-state", "indeterminate")
  await expect(page.locator(label)).toHaveAttribute("data-state", "indeterminate")
  await expect(page.locator(control)).toHaveAttribute("data-state", "indeterminate")
  await expectLabelText(page, "Indeterminate")
}

test.beforeEach(async ({ page }) => {
  await page.goto("/checkbox")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page)
})

test("should be checked when clicked", async ({ page }) => {
  await page.click(root)
  await expectToBeChecked(page)
})

test("should be focused when page is tabbed", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(input)).toBeFocused()
  await expect(page.locator(control)).toHaveAttribute("data-focus", "")
})

test("should be checked when spacebar is pressed while focused", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.keyboard.press(" ")
  await expectToBeChecked(page)
})

test("should have disabled attributes when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await expect(page.locator(input)).toBeDisabled()
})

test("should not be focusable when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(input)).not.toBeFocused()
})

test("input is not blurred on label click", async ({ page }) => {
  let blurCount = 0
  await page.exposeFunction("trackBlur", () => blurCount++)
  await page.locator(input).evaluate((input) => {
    input.addEventListener("blur", (window as any).trackBlur)
  })
  await page.click(label)
  await page.click(label)
  await page.click(label)
  expect(blurCount).toBe(0)
})

test("buttons should update checkbox state", async ({ page }) => {
  await page.click('button:has-text("Check")')
  await expectToBeChecked(page)

  await page.click('button:has-text("Uncheck")')
  await expect(page.locator(root)).toHaveAttribute("data-state", "unchecked")
  await expectLabelText(page, "Unchecked")

  await page.click('button:has-text("Indeterminate")')
  await expectToBeIndeterminate(page)
})

test.describe("indeterminate checkbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/checkbox-indeterminate")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("should start as indeterminate", async ({ page }) => {
    await expectToBeIndeterminate(page)
  })

  test("should be checked when clicked", async ({ page }) => {
    await page.click(root)
    await expectToBeChecked(page)
  })

  test("buttons should update checkbox state", async ({ page }) => {
    // Click "Check" button
    await page.click('button:has-text("Check")')
    await expectToBeChecked(page)

    // Click "Uncheck" button
    await page.click('button:has-text("Uncheck")')
    await expect(page.locator(root)).toHaveAttribute("data-state", "unchecked")
    await expectLabelText(page, "Unchecked")

    // Click "Indeterminate" button
    await page.click('button:has-text("Indeterminate")')
    await expectToBeIndeterminate(page)
  })
})
