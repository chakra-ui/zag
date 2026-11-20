import { expect, test } from "./_test"

test.describe("presence notifications", () => {
  test("a dismissed notification animates out, then leaves the list", async ({ page }) => {
    await page.goto("/presence/notifications")
    const items = page.getByTestId("notifications").getByRole("listitem")
    const invite = items.filter({ hasText: "Invite accepted" })

    await expect(items).toHaveCount(3)
    await invite.getByRole("button", { name: "Dismiss" }).click()

    await expect(invite).toHaveAttribute("data-state", "closed")
    await expect(items).toHaveCount(2)
    await expect(items.filter({ hasText: "Invite accepted" })).toHaveCount(0)
    await expect(page.getByTestId("dismissed-count")).toHaveText("1 dismissed")

    await items.filter({ hasText: "Build finished" }).getByRole("button", { name: "Dismiss" }).click()
    await expect(items).toHaveCount(1)
    await expect(items.first()).toContainText("Payment received")
    await expect(page.getByTestId("dismissed-count")).toHaveText("2 dismissed")
  })
})
