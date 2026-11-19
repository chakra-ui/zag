import { expect, test } from "./_test"

test.describe("toggle text formatting", () => {
  test("each toggle is its own machine and styles the preview", async ({ page }) => {
    await page.goto("/toggle/text-formatting")
    const bold = page.getByRole("button", { name: "Bold" })
    const italic = page.getByRole("button", { name: "Italic" })
    const underline = page.getByRole("button", { name: "Underline" })
    const preview = page.getByTestId("preview")

    await expect(preview).toHaveCSS("font-weight", "400")
    await expect(bold).toHaveAttribute("aria-pressed", "false")
    await expect(bold).not.toHaveAttribute("data-pressed", "")

    await bold.click()
    await expect(bold).toHaveAttribute("data-pressed", "")
    await expect(bold).toHaveAttribute("aria-pressed", "true")
    await expect(preview).toHaveCSS("font-weight", "700")
    await expect(italic).toHaveAttribute("aria-pressed", "false")
    await expect(preview).toHaveCSS("font-style", "normal")

    await italic.click()
    await expect(preview).toHaveCSS("font-style", "italic")
    await expect(preview).toHaveCSS("font-weight", "700")

    await underline.click()
    await expect(preview).toHaveCSS("text-decoration-line", "underline")

    await bold.click()
    await expect(bold).not.toHaveAttribute("data-pressed", "")
    await expect(preview).toHaveCSS("font-weight", "400")
    await expect(preview).toHaveCSS("font-style", "italic")
  })

  test("toggles with Space and Enter", async ({ page }) => {
    await page.goto("/toggle/text-formatting")
    const italic = page.getByRole("button", { name: "Italic" })
    const preview = page.getByTestId("preview")

    await italic.focus()
    await page.keyboard.press("Space")
    await expect(italic).toHaveAttribute("aria-pressed", "true")
    await expect(preview).toHaveCSS("font-style", "italic")

    await page.keyboard.press("Enter")
    await expect(italic).toHaveAttribute("aria-pressed", "false")
    await expect(preview).toHaveCSS("font-style", "normal")
  })
})
