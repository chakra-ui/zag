import { expect, test } from "./_test"

test.describe("pin-input invite-code", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pin-input/invite-code")
  })

  test("typing uppercases each character and submits when complete", async ({ page }) => {
    await page.getByRole("textbox", { name: "Character 1 of 6" }).click()
    await page.keyboard.type("abc12")
    await expect(page.getByTestId("form-output")).toHaveCount(0)

    await page.keyboard.type("3")
    const inputs = page.locator("[data-pin-input-input]")
    expect(await inputs.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value).join(""))).toBe("ABC123")
    await expect(page.getByTestId("form-output")).toHaveText("invite=ABC123")
  })

  test("pasting a code fills every box", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.evaluate(() => navigator.clipboard.writeText("x7k-9p2"))
    await page.getByRole("textbox", { name: "Character 1 of 6" }).click()
    await page.keyboard.press("ControlOrMeta+v")
    await expect(page.getByTestId("form-output")).toHaveText("invite=X7K9P2")
  })

  test("symbols are rejected", async ({ page }) => {
    const first = page.getByRole("textbox", { name: "Character 1 of 6" })
    await first.click()
    await page.keyboard.type("#")
    await expect(first).toHaveValue("")
    await expect(page.getByText("Use letters and numbers only")).toBeVisible()
  })
})
