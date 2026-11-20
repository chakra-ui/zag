import { expect, test } from "./_test"

test.describe("timer resend-code", () => {
  test("resend unlocks when the countdown completes and restarts it", async ({ page }) => {
    await page.clock.install()
    await page.goto("/timer/resend-code")
    const resend = page.getByRole("button", { name: /Resend code/ })

    await expect(resend).toBeDisabled()
    await expect(resend).toHaveText("Resend code in 30s")

    await page.clock.runFor(10_000)
    await expect(resend).toHaveText("Resend code in 20s")
    await expect(resend).toBeDisabled()

    await page.clock.runFor(21_000)
    await expect(resend).toBeEnabled()
    await expect(resend).toHaveText("Resend code")

    await resend.click()
    await expect(page.getByTestId("sent-count")).toHaveText("Sent 2 codes")
    await expect(resend).toBeDisabled()
    await expect(resend).toHaveText("Resend code in 30s")
  })
})
