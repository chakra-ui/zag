import { expect, test } from "@playwright/test"

const trigger = (id: string) => `[data-scope="select"][data-part="trigger"][id="select:${id}:trigger"]`
const content = (id: string) => `[data-scope="select"][data-part="content"][id="select:${id}:content"]`

test.describe("select / multiple controlled", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/select/multiple-controlled")
  })

  test("opening a select closes the open one and stays open itself", async ({ page }) => {
    await page.click(trigger("a"))
    await expect(page.locator(content("a"))).toBeVisible()

    await page.click(trigger("b"))

    await expect(page.locator(content("a"))).toBeHidden()
    await expect(page.locator(content("b"))).toBeVisible()
  })
})
