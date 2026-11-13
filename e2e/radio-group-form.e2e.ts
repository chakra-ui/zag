import { expect, test } from "./_test"

test.describe("radio-group form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/radio-group/form")
  })

  test("group is required and named", async ({ page }) => {
    await expect(page.getByRole("radiogroup")).toHaveAttribute("aria-required", "true")
    const email = page.getByRole("radio", { name: "Email" })
    await expect(email).toHaveAttribute("name", "contact")
    await expect(email).toHaveAttribute("required", "")
  })

  test("submitting with no selection shows the invalid state", async ({ page }) => {
    const group = page.getByRole("radiogroup")
    await expect(group).not.toHaveAttribute("data-invalid", "")
    await expect(page.getByText("Choose a contact method.")).toBeHidden()

    await page.getByRole("button", { name: "Save preference" }).click()
    await expect(group).toHaveAttribute("data-invalid", "")
    await expect(page.getByRole("radio", { name: "Email" })).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByText("Choose a contact method.")).toBeVisible()
    await expect(page.getByTestId("form-output")).toBeHidden()

    // choosing clears the error
    await page.getByTestId("radio-phone").click()
    await expect(group).not.toHaveAttribute("data-invalid", "")
    await expect(page.getByText("Choose a contact method.")).toBeHidden()
  })

  test("selecting then submitting renders the form data, reset restores everything", async ({ page }) => {
    const output = page.getByTestId("form-output")

    await page.getByTestId("radio-phone").click()
    await page.getByRole("button", { name: "Save preference" }).click()
    await expect(output).toContainText('"contact": "phone"')

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(output).toBeHidden()
    for (const name of ["Email", "Phone call", "Post"]) {
      await expect(page.getByRole("radio", { name })).not.toBeChecked()
    }
    await expect(page.getByTestId("radio-phone")).toHaveAttribute("data-state", "unchecked")

    // state agrees with the DOM: submitting now is invalid again
    await page.getByRole("button", { name: "Save preference" }).click()
    await expect(page.getByText("Choose a contact method.")).toBeVisible()
    await expect(output).toBeHidden()
  })

  test("reset from the invalid state clears the error", async ({ page }) => {
    await page.getByRole("button", { name: "Save preference" }).click()
    await expect(page.getByText("Choose a contact method.")).toBeVisible()

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(page.getByText("Choose a contact method.")).toBeHidden()
    await expect(page.getByRole("radiogroup")).not.toHaveAttribute("data-invalid", "")
    for (const name of ["Email", "Phone call", "Post"]) {
      await expect(page.getByRole("radio", { name })).not.toBeChecked()
    }
  })
})
