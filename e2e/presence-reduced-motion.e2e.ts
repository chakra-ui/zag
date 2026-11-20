import { expect, test } from "./_test"

test.describe("presence reduced-motion", () => {
  test("waits for the exit animation by default", async ({ page }) => {
    await page.goto("/presence/reduced-motion")
    const details = page.getByTestId("order-details")

    await expect(details).toBeVisible()
    await page.getByRole("button", { name: "Hide details" }).click()
    await expect(details).toHaveAttribute("data-state", "closed")
    await expect(details).toHaveCount(0)
  })

  test("unmounts right away when the user prefers reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/presence/reduced-motion")
    const details = page.getByTestId("order-details")

    await expect(details).toBeVisible()
    await page.getByRole("button", { name: "Hide details" }).click()
    // the exit animation is 600ms, so this only passes if presence skips it
    await expect(details).toHaveCount(0, { timeout: 200 })

    await page.getByRole("button", { name: "Show details" }).click()
    await expect(details).toBeVisible()
  })
})
