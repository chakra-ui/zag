import { expect, test } from "./_test"

test.describe("timer pomodoro", () => {
  test("progress follows the focus session and restart resets it", async ({ page }) => {
    await page.clock.install()
    await page.goto("/timer/pomodoro")
    const progress = page.getByRole("progressbar", { name: "Focus session" })

    await expect(progress).toHaveAttribute("aria-valuenow", "0")
    await expect(page.locator("[data-timer-area]")).toHaveText(/25\s*:\s*00/)

    await page.getByRole("button", { name: "Start focus" }).click()
    await page.clock.runFor(5 * 60_000)
    await expect(progress).toHaveAttribute("aria-valuenow", "20")
    await expect(page.locator("[data-timer-area]")).toHaveText(/20\s*:\s*00/)

    await page.getByRole("button", { name: "Pause" }).click()
    await page.clock.runFor(60_000)
    await expect(progress).toHaveAttribute("aria-valuenow", "20")

    await page.getByRole("button", { name: "Restart" }).click()
    await expect(progress).toHaveAttribute("aria-valuenow", "0")
    await expect(page.locator("[data-timer-area]")).toHaveText(/25\s*:\s*00/)
  })
})
