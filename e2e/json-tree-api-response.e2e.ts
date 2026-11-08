import { expect, test } from "./_test"

test.describe("json-tree api-response", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/json-tree/api-response")
  })

  test("should show only the first two items in collection previews", async ({ page }) => {
    const tags = page.getByRole("row", { name: /^tags:/ })
    await expect(tags).toContainText("gift")
    await expect(tags).toContainText("priority")
    await expect(tags).not.toContainText("fragile")
  })

  test("should reveal every Map entry when the Map node is expanded", async ({ page }) => {
    const metadata = page.getByRole("row", { name: /^metadata:/ })
    await expect(metadata).toHaveAttribute("aria-expanded", "false")
    await expect(metadata).not.toContainText("warehouse")

    await metadata.click()
    await expect(metadata).toHaveAttribute("aria-expanded", "true")

    await page.getByRole("row", { name: /^\[\[Entries\]\]:/ }).click()
    await expect(page.getByRole("row").filter({ hasText: 'key: "warehouse", value: "rotterdam-2"' })).toBeVisible()
  })

  test("should reveal every Set entry when the Set node is expanded", async ({ page }) => {
    const tags = page.getByRole("row", { name: /^tags:/ })
    await expect(tags).toHaveAttribute("aria-expanded", "false")

    await tags.click()
    await expect(tags).toHaveAttribute("aria-expanded", "true")

    await page.getByRole("row", { name: /^\[\[Entries\]\]:/ }).click()
    await expect(page.getByRole("row", { name: '2: "fragile"' })).toBeVisible()
  })

  test("should render the Date, URL and Error values", async ({ page }) => {
    await expect(page.getByRole("row", { name: /^placedAt:/ })).toContainText("2026-11-05T14:12:45.000Z")
    await expect(page.getByRole("row", { name: /^receiptUrl:/ })).toContainText(
      "https://shop.example.com/orders/ord_10482/receipt",
    )

    await page.getByRole("row", { name: /^lastWebhook:/ }).click()
    await expect(page.getByRole("row", { name: /^error:/ })).toContainText("Webhook endpoint timed out after 5000ms")
  })
})
