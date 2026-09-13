import { expect, test } from "@playwright/test"

const trigger = '[data-scope="menu"][data-part="trigger"]'
const content = '[data-scope="menu"][data-part="content"]'
const item = '[data-scope="menu"][data-part="item"]'

// the content element is kept mounted while closed and re-parented into a portal on open,
// so a soon-to-be-detached node exists when the dismissable layer resolves its node
test.describe("menu / re-parented content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/conditional-portal")
  })

  test("should stay open when the content is re-parented on open", async ({ page }) => {
    await page.click(trigger)

    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator("[data-testid=open-state]")).toHaveText("true")
    await expect(page.locator("[data-testid=log]")).toHaveText("open:true")
  })

  test("should select an item in the re-parented content", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()

    await page.locator(item).first().click()

    await expect(page.locator("[data-testid=log]")).toHaveText("open:true,select:edit,open:false")
  })

  test("should close on escape", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")

    await expect(page.locator("[data-testid=open-state]")).toHaveText("false")
  })
})
