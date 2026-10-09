import { expect, test } from "@playwright/test"
import { testid } from "./_utils"

test("should sync the native input when initially indeterminate", async ({ page }) => {
  await page.goto("/checkbox/indeterminate")

  const input = page.locator(testid("hidden-input"))
  await expect(input).toHaveJSProperty("indeterminate", true)
  await expect(input).toHaveJSProperty("checked", false)
})
