import { expect, test } from "./_test"

test.describe("clipboard share-link", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {})
    await page.goto("/clipboard/share-link")
  })

  test("should flag the trigger as copied, then reset after the timeout", async ({ page }) => {
    const trigger = page.locator("[data-clipboard-trigger]")
    await expect(trigger).not.toHaveAttribute("data-copied", "")
    await expect(trigger).toHaveAccessibleName("Copy link")

    await trigger.click()
    await expect(trigger).toHaveAttribute("data-copied", "")
    await expect(trigger).toHaveText("Link copied")
    await expect(trigger).toHaveAccessibleName("Link copied")

    await expect(trigger).not.toHaveAttribute("data-copied", "", { timeout: 3000 })
    await expect(trigger).toHaveText("Copy link")
  })
})
