import { expect, test } from "./_test"

test.describe("fieldset notification preferences", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fieldset/notification-preferences")
  })

  test("legend names the group and helper text describes it", async ({ page }) => {
    const group = page.getByRole("group", { name: "Email notifications" })
    await expect(group).toBeVisible()
    await expect(group).toHaveAccessibleDescription("Choose which emails you would like to receive.")
    await expect(group.getByRole("checkbox")).toHaveCount(3)
  })

  test("checkbox choices update the summary", async ({ page }) => {
    const group = page.getByRole("group", { name: "Email notifications" })
    const summary = page.getByTestId("summary")
    await expect(summary).toHaveText("Subscribed to: Order updates")

    await group.getByRole("checkbox", { name: "Price drops" }).check()
    await expect(summary).toHaveText("Subscribed to: Order updates, Price drops")

    await group.getByRole("checkbox", { name: "Order updates" }).uncheck()
    await group.getByRole("checkbox", { name: "Price drops" }).uncheck()
    await expect(summary).toHaveText("No emails selected")

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(summary).toHaveText("Subscribed to: Order updates")
  })
})
