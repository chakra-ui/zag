import { expect, test } from "./_test"

test.describe("clipboard api-key", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {})
    await page.goto("/clipboard/api-key")
  })

  test("should update the input when the value is regenerated", async ({ page }) => {
    const input = page.locator("[data-clipboard-input]")
    const initial = await input.inputValue()
    expect(initial).toMatch(/^zag_live_/)

    await page.getByRole("button", { name: "Regenerate" }).click()
    await expect(input).not.toHaveValue(initial)
    await expect(input).toHaveValue(/^zag_live_/)
  })

  test("should show the copied status and clear it on regenerate", async ({ page }) => {
    const status = page.getByTestId("status")
    await expect(status).toBeEmpty()

    await page.locator("[data-clipboard-trigger]").click()
    await expect(status).toHaveText("Copied!")

    await page.getByRole("button", { name: "Regenerate" }).click()
    await expect(status).toBeEmpty()
  })
})
