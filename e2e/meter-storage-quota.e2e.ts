import { expect, test } from "./_test"

test.describe("meter storage-quota", () => {
  test("controlled usage drives the value text and state", async ({ page }) => {
    await page.goto("/meter/storage-quota")
    const meter = page.getByRole("meter", { name: "Storage used" })
    const valueText = page.locator("[data-meter-value-text]")
    const upload = page.getByRole("button", { name: "Upload photo library (128 GB)" })
    // scoped: Next adds its own role="alert" route announcer to every page
    const alert = page.locator(".meter-storage-quota").getByRole("alert")

    await expect(valueText).toHaveText("384 GB of 512 GB")
    await expect(meter).toHaveAttribute("aria-valuetext", "384 GB of 512 GB")
    await expect(meter).toHaveAttribute("data-state", "suboptimal")

    await page.getByRole("button", { name: "Delete old backups (128 GB)" }).click()
    await expect(valueText).toHaveText("256 GB of 512 GB")
    await expect(meter).toHaveAttribute("aria-valuenow", "256")
    await expect(meter).toHaveAttribute("data-state", "optimal")
    await expect(page.getByRole("button", { name: "Delete old backups (128 GB)" })).toBeDisabled()

    await upload.click()
    await expect(valueText).toHaveText("384 GB of 512 GB")
    await expect(alert).toHaveCount(0)

    await upload.click()
    await expect(valueText).toHaveText("512 GB of 512 GB")
    await expect(meter).toHaveAttribute("data-state", "least-optimal")
    await expect(alert).toHaveText("Storage is full. New files won't sync.")
    await expect(upload).toBeDisabled()
  })
})
