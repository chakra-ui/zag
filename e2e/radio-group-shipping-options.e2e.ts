import { expect, test } from "./_test"

test.describe("radio-group shipping-options", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/radio-group/shipping-options")
  })

  test("each option carries its name, price and delivery time", async ({ page }) => {
    const express = page.getByRole("radio", { name: /Express/ })
    await expect(express).toHaveAccessibleName("Express $12.00 2-3 business days")
    await expect(page.getByRole("radio", { name: /Standard/ })).toBeChecked()
  })

  test("arrow keys move the selection", async ({ page }) => {
    const standard = page.getByRole("radio", { name: /Standard/ })
    const express = page.getByRole("radio", { name: /Express/ })
    const overnight = page.getByRole("radio", { name: /Overnight/ })

    await standard.focus()
    await page.keyboard.press("ArrowDown")
    await expect(express).toBeChecked()
    await expect(express).toBeFocused()

    await page.keyboard.press("ArrowDown")
    await expect(overnight).toBeChecked()
    await expect(standard).not.toBeChecked()

    await page.keyboard.press("ArrowUp")
    await expect(express).toBeChecked()
  })

  test("clicking anywhere on a card selects it", async ({ page }) => {
    await page.getByTestId("radio-overnight").click()
    await expect(page.getByRole("radio", { name: /Overnight/ })).toBeChecked()
    await expect(page.getByTestId("radio-overnight")).toHaveAttribute("data-state", "checked")
  })
})
