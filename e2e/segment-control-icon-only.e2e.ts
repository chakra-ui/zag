import { expect, test } from "./_test"

test.describe("segment-control icon-only", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/segment-control/icon-only")
  })

  test("icon items are named by their aria-label", async ({ page }) => {
    const center = page.getByRole("radio", { name: "Align center" })
    await expect(center).toHaveAccessibleName("Align center")
    await expect(page.getByRole("radio", { name: "Align left" })).toBeChecked()
    await expect(page.getByRole("radio", { name: "Justify" })).toHaveCount(1)
    await expect(page.getByTestId("radio-center").locator("svg")).toBeVisible()
  })

  test("selecting an icon aligns the preview", async ({ page }) => {
    const preview = page.getByTestId("preview")
    await expect(preview).toHaveAttribute("data-align", "left")

    await page.getByTestId("radio-center").click()
    await expect(page.getByRole("radio", { name: "Align center" })).toBeChecked()
    await expect(preview).toHaveAttribute("data-align", "center")
    await expect(preview).toHaveCSS("text-align", "center")

    await page.getByRole("radio", { name: "Align center" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Align right" })).toBeChecked()
    await expect(preview).toHaveCSS("text-align", "right")
  })
})
