import { expect, test } from "./_test"

test.describe("marquee vertical", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marquee/vertical")
  })

  test("side bottom scrolls the testimonials vertically", async ({ page }) => {
    const root = page.getByRole("region", { name: "Marquee content" })
    await expect(root).toHaveAttribute("data-orientation", "vertical")
    await expect(page.locator("[data-marquee-viewport]")).toHaveAttribute("data-side", "bottom")
    await expect(page.locator("[data-marquee-content]").first()).toHaveAttribute("data-side", "bottom")
    await expect(page.getByText("Priya Raman").first()).toBeAttached()
  })

  test("hovering a testimonial pauses the scroll and leaving resumes it", async ({ page }) => {
    const root = page.getByRole("region", { name: "Marquee content" })
    await expect(root).not.toHaveAttribute("data-paused")

    await root.hover()
    await expect(root).toHaveAttribute("data-paused", "")

    await page.mouse.move(0, 0)
    await expect(root).not.toHaveAttribute("data-paused")
  })
})
