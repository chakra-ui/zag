import { expect, test } from "./_test"

test.describe("json-tree circular", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/json-tree/circular")
  })

  test("should show a circular marker for the self reference", async ({ page }) => {
    const self = page.getByRole("row", { name: "self: circular reference" })
    await expect(self).toBeVisible()
    await expect(self).toContainText("[Circular Reference]")
  })

  test("should expand every level without hanging and mark each back reference", async ({ page }) => {
    await page.getByRole("button", { name: "Expand all" }).click()
    await expect(page.getByRole("row", { name: /^owner:/ })).toBeVisible()
    await expect(page.getByRole("row", { name: /circular reference$/ })).toHaveCount(2)
  })
})
