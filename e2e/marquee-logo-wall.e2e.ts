import { expect, test } from "./_test"

test.describe("marquee logo wall", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marquee/logo-wall")
  })

  test("autoFill repeats the logos to fill the row", async ({ page }) => {
    const root = page.getByRole("region", { name: "Marquee content" })
    await expect(root).toBeVisible()

    // without autoFill the content renders once plus a single clone
    await expect.poll(() => page.locator("[data-marquee-content]").count()).toBeGreaterThan(2)

    const clones = page.locator("[data-marquee-content][data-clone]")
    expect(await clones.count()).toBeGreaterThan(1)
    await expect(clones.first()).toHaveAttribute("aria-hidden", "true")
  })

  test("the original row lists each brand once and the edges fade it", async ({ page }) => {
    const original = page.locator("[data-marquee-content]:not([data-clone])")
    await expect(original.locator("[data-marquee-item]")).toHaveText(["Fernhill", "Tidewater", "Quarry", "Kestrel"])
    await expect(page.locator("[data-marquee-edge]")).toHaveCount(2)
  })
})
