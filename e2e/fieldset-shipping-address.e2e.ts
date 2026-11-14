import { expect, test } from "./_test"

test.describe("fieldset shipping address", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fieldset/shipping-address")
  })

  test("same as billing disables the fields and re-enables them when unchecked", async ({ page }) => {
    const group = page.getByRole("group", { name: "Shipping address" })
    const street = page.getByLabel("Street address")
    const postal = page.getByLabel("Postal code")
    const same = page.getByRole("checkbox", { name: "Same as billing address" })

    await expect(street).toBeEnabled()
    await expect(postal).toBeEnabled()
    await expect(group).not.toHaveAttribute("disabled")

    await same.check()
    await expect(group).toHaveAttribute("disabled", "")
    await expect(street).toBeDisabled()
    await expect(postal).toBeDisabled()
    await expect(street).toHaveAttribute("data-disabled", "")
    await expect(postal).toHaveAttribute("data-disabled", "")

    await same.uncheck()
    await expect(group).not.toHaveAttribute("disabled")
    await expect(street).toBeEnabled()
    await expect(postal).toBeEnabled()
    await expect(street).not.toHaveAttribute("data-disabled")
    await street.fill("350 Fifth Avenue")
    await expect(street).toHaveValue("350 Fifth Avenue")
  })

  test("disabled fields are left out of the submitted form", async ({ page }) => {
    await page.getByLabel("Street address").fill("350 Fifth Avenue")
    await page.getByLabel("Postal code").fill("10118")
    await page.getByRole("button", { name: "Save address" }).click()
    const output = page.getByTestId("form-output")
    await expect(output).toContainText('"street": "350 Fifth Avenue"')
    await expect(output).toContainText('"postalCode": "10118"')

    await page.getByRole("checkbox", { name: "Same as billing address" }).check()
    await page.getByRole("button", { name: "Save address" }).click()
    await expect(output).toContainText('"sameAsBilling"')
    await expect(output).not.toContainText("street")
    await expect(output).not.toContainText("postalCode")
  })

  test("reset restores the defaults", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Same as billing address" }).check()
    await page.getByRole("button", { name: "Reset" }).click()
    await expect(page.getByRole("checkbox", { name: "Same as billing address" })).not.toBeChecked()
    await expect(page.getByLabel("Street address")).toBeEnabled()
    await expect(page.getByTestId("form-output")).toBeHidden()
  })
})
