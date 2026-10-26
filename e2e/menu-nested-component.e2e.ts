import { expect, test } from "./_test"
import { testid } from "./_utils"

test.describe("menu / nested component", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "vue", "Vue example")

  test("should open a submenu with inline positioning without recursive updates", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await page.goto("/menu/nested-component")

    await page.click(testid("trigger"))
    await expect(page.locator(testid("menu"))).toBeFocused()

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await expect(page.locator(testid("share-trigger"))).toHaveAttribute("data-highlighted", "")

    await page.keyboard.press("ArrowRight")
    await expect(page.locator(testid("share-submenu"))).toBeVisible()
    await expect(page.locator(testid("share-submenu"))).toBeFocused()

    expect(errors).toEqual([])
  })
})
