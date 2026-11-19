import { expect, test } from "./_test"

test.describe("toggle favorite", () => {
  test("controlled pressed round-trips with the counter and Reset", async ({ page }) => {
    await page.goto("/toggle/favorite")
    const toggle = page.getByRole("button", { name: "Save recipe" })
    const count = page.getByTestId("saved-count")

    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await expect(count).toHaveText("Saved by 128 people")

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await expect(toggle).toHaveAttribute("data-pressed", "")
    await expect(count).toHaveText("Saved by 129 people")

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await expect(count).toHaveText("Saved by 128 people")

    await toggle.click()
    await expect(count).toHaveText("Saved by 129 people")

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await expect(toggle).not.toHaveAttribute("data-pressed", "")
    await expect(count).toHaveText("Saved by 128 people")

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await expect(count).toHaveText("Saved by 129 people")
  })
})
