import { expect, test } from "./_test"

const area = "[data-timer-area]"
const readTime = (page: import("@playwright/test").Page) =>
  page.locator(area).evaluate((el) => el.textContent!.replace(/\s+/g, ""))

test.describe("timer", () => {
  test("stopwatch counts up from 0", async ({ page }) => {
    await page.goto("/timer/stopwatch")
    await expect(page.locator(area)).toHaveText(/00\s*:\s*00\s*:\s*00\s*:\s*02/, { timeout: 4000 })
  })

  test("pausing holds the time and resuming continues", async ({ page }) => {
    await page.goto("/timer/stopwatch")
    await expect(page.locator(area)).toHaveText(/:\s*01$/, { timeout: 3000 })
    await page.getByRole("button", { name: "PAUSE" }).click()
    const paused = await readTime(page)
    await page.waitForTimeout(1500)
    expect(await readTime(page)).toBe(paused)

    await page.getByRole("button", { name: "RESUME" }).click()
    await expect.poll(() => readTime(page), { timeout: 3000 }).not.toBe(paused)
  })

  test("reset goes back to 0", async ({ page }) => {
    await page.goto("/timer/stopwatch")
    await expect(page.locator(area)).toHaveText(/:\s*01$/, { timeout: 3000 })
    await page.getByRole("button", { name: "RESET" }).click()
    expect(await readTime(page)).toBe("00:00:00:00")
  })

  test("countdown counts down", async ({ page }) => {
    await page.goto("/timer/countdown")
    const start = await readTime(page)
    await expect.poll(() => readTime(page), { timeout: 3000 }).not.toBe(start)
    expect((await readTime(page)) < start).toBe(true)
  })
})
