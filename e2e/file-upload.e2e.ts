import { test, expect } from "@playwright/test"
import { a11y, part, controls, testid } from "./_utils"
import path from "node:path"

const root = part("root")
const trigger = part("trigger")
const dropzone = part("dropzone")

test.describe("file-upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/file-upload")
  })

  // TBD: fix a11y complaints
  test.skip("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("should be focused when page is tabbed", async ({ page }) => {
    const dropzone = part("dropzone")

    await page.click("main")
    await page.keyboard.press("Tab")

    await expect(page.locator(dropzone)).toBeFocused()
  })

  test("should open file picker on trigger click", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser")

    await page.locator(trigger).click()

    const prom = await fileChooserPromise

    expect(prom).toBeDefined()
  })

  test("should display chosen file", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser")
    await page.locator(trigger).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, "fixtures/text.txt"))

    const item = page.locator(part("item"))
    const deleteTrigger = page.locator(part("item-delete-trigger"))

    expect(item).toBeVisible()
    expect(await item.innerText()).toContain("text.txt")
    expect(deleteTrigger).toBeVisible()
  })

  test("should have disabled attributes when disabled", async ({ page }) => {
    await controls(page).bool("disabled")
    await expect(page.locator(root)).toHaveAttribute("data-disabled", "")
    await expect(page.locator(dropzone)).toHaveAttribute("data-disabled", "")
    await expect(page.locator(trigger)).toHaveAttribute("data-disabled", "")
    await expect(page.locator(trigger)).toBeDisabled()
    await expect(page.locator(testid("input"))).toBeDisabled()
  })
})
