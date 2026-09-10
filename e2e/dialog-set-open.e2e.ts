import { expect, test } from "@playwright/test"

const content = '[data-scope="dialog"][data-part="content"]'
const openState = "[data-testid=open-state]"
const openChangeLog = "[data-testid=open-change-log]"

test.describe("dialog / setOpen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog/set-open")
  })

  test("should open and close through the api", async ({ page }) => {
    await page.click("[data-testid=set-open]")
    await expect(page.locator(content)).toBeVisible()

    await page.click("[data-testid=content-set-closed]")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(openChangeLog)).toHaveText("true,false")
  })

  test("should close when setOpen(false) follows setOpen(true) in the same tick", async ({ page }) => {
    await page.click("[data-testid=open-then-close]")

    await expect(page.locator(openState)).toHaveText("false")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(openChangeLog)).toHaveText("")
  })

  test("should open when setOpen(true) follows setOpen(false) in the same tick", async ({ page }) => {
    await page.click("[data-testid=close-then-open]")

    await expect(page.locator(openState)).toHaveText("true")
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(openChangeLog)).toHaveText("true")
  })

  test("should invoke onOpenChange once when setOpen is repeated", async ({ page }) => {
    await page.click("[data-testid=open-repeatedly]")

    await expect(page.locator(openState)).toHaveText("true")
    await expect(page.locator(openChangeLog)).toHaveText("true")
  })

  test("should not invoke onOpenChange when closing an already closed dialog", async ({ page }) => {
    await page.click("[data-testid=set-closed]")
    await page.click("[data-testid=set-closed]")

    await expect(page.locator(openState)).toHaveText("false")
    await expect(page.locator(openChangeLog)).toHaveText("")
  })
})
