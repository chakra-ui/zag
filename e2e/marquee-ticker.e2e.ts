import { expect, test } from "./_test"

test.describe("marquee ticker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marquee/ticker")
  })

  test("the external button drives the paused state both ways", async ({ page }) => {
    const root = page.getByRole("region", { name: "Marquee content" })
    await expect(root).not.toHaveAttribute("data-paused")

    await page.getByRole("button", { name: "Pause" }).click()
    await expect(root).toHaveAttribute("data-paused", "")
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible()

    await page.getByRole("button", { name: "Resume" }).click()
    await expect(root).not.toHaveAttribute("data-paused")
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  test("a user pause from hovering updates the external button", async ({ page }) => {
    const root = page.getByRole("region", { name: "Marquee content" })

    await root.hover()
    await expect(root).toHaveAttribute("data-paused", "")
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible()

    await page.mouse.move(0, 0)
    await expect(root).not.toHaveAttribute("data-paused")
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  test("finishes after two loops", async ({ page }) => {
    const status = page.getByTestId("status")
    await expect(status).toBeEmpty()
    await expect(status).toHaveText("Finished", { timeout: 15_000 })
  })

  test("pausing holds the ticker back from finishing", async ({ page }) => {
    await page.getByRole("button", { name: "Pause" }).click()
    await page.waitForTimeout(3000)
    await expect(page.getByTestId("status")).toBeEmpty()

    await page.getByRole("button", { name: "Resume" }).click()
    await expect(page.getByTestId("status")).toHaveText("Finished", { timeout: 15_000 })
  })
})
