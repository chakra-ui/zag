import { expect, test } from "@playwright/test"
import { a11y, testid } from "./__utils"

const input = testid("input")
const preview = testid("preview")
const save = testid("save-button")
const edit = testid("edit-button")

test.describe("editable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editable")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test.describe.parallel("when in edit mode", () => {
    test("input should be visible", async ({ page }) => {
      await page.focus(preview)

      await expect(page.locator(input)).toBeVisible()
      await expect(page.locator(input)).toBeFocused()
    })

    test("user can type and commit input value", async ({ page }) => {
      await page.focus(preview)
      await page.type(input, "Hello World")
      await page.locator(input).press("Enter")

      await expect(page.locator(input)).toBeHidden()
      await expect(page.locator(preview)).toBeVisible()
      await expect(page.locator(preview)).toHaveText("Hello World")
    })

    test("user can type and revert value", async ({ page }) => {
      await page.focus(preview)
      await page.type(input, "Hello")
      await page.keyboard.press("Enter")

      await page.focus(preview)
      await page.type(input, "Naruto")
      await page.keyboard.press("Escape")

      await expect(page.locator(preview)).toHaveText("Hello")
      await expect(page.locator(input)).toBeHidden()
    })

    test("clicking submit: user can type and submit value", async ({ page }) => {
      await page.focus(preview)
      await page.type(input, "Naruto")
      await page.click(save)

      await expect(page.locator(preview)).toHaveText("Naruto")
    })

    test("blur the input: user can type and submit value", async ({ page }) => {
      await page.focus(preview)
      await page.type(input, "Naruto")
      await page.click("body", { force: true })

      await expect(page.locator(preview)).toHaveText("Naruto")
    })
  })

  test.describe("when in preview mode", () => {
    test("clicking edit button should enter edit mode", async ({ page }) => {
      await page.click(edit)
      await expect(page.locator(input)).toBeVisible()
      await expect(page.locator(input)).toBeFocused()
    })
  })
})
