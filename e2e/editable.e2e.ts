import { expect, test } from "@playwright/test"
import { a11y, setup } from "./test-utils"

const input = setup("input")
const preview = setup("preview")
const save = setup("save-button")
const edit = setup("edit-button")

test.describe("editable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editable")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test.describe.parallel("when in edit mode", () => {
    test("input should be visible", async ({ page }) => {
      await page.focus(preview.id)

      await expect(input.el(page)).toBeVisible()
      await expect(input.el(page)).toBeFocused()
    })

    test("user can type and commit input value", async ({ page }) => {
      await page.focus(preview.id)
      await page.type(input.id, "Hello World")
      await input.el(page).press("Enter")

      await expect(input.el(page)).toBeHidden()
      await expect(preview.el(page)).toBeVisible()
      await expect(preview.el(page)).toHaveText("Hello World")
    })

    test("user can type and revert value", async ({ page }) => {
      await page.focus(preview.id)
      await page.type(input.id, "Hello")
      await page.keyboard.press("Enter")

      await page.focus(preview.id)
      await page.type(input.id, "Naruto")
      await page.keyboard.press("Escape")

      await expect(preview.el(page)).toHaveText("Hello")
      await expect(input.el(page)).toBeHidden()
    })

    test("clicking submit: user can type and submit value", async ({ page }) => {
      await page.focus(preview.id)
      await page.type(input.id, "Naruto")
      await page.click(save.id)

      await expect(preview.el(page)).toHaveText("Naruto")
    })

    test("blur the input: user can type and submit value", async ({ page }) => {
      await page.focus(preview.id)
      await page.type(input.id, "Naruto")
      await page.click("body", { force: true })

      await expect(preview.el(page)).toHaveText("Naruto")
    })
  })

  test.describe("when in preview mode", () => {
    test("clicking edit button should enter edit mode", async ({ page }) => {
      await page.click(edit.id)
      await expect(input.el(page)).toBeVisible()
      await expect(input.el(page)).toBeFocused()
    })
  })
})
