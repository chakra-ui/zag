import { expect, test, type Page } from "@playwright/test"

async function goto(page: Page) {
  await page.goto("/number-input/controlled-clamp")
}

test.describe("number input / controlled-clamp", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test("rewrites the input when the parent clamps the typed value", async ({ page }) => {
    await goto(page)
    const input = page.getByTestId("input")

    await input.click()
    await page.keyboard.type("10")
    await expect(input).toHaveValue("10")
    await expect(input).toHaveAttribute("aria-valuenow", "10")

    // typing past the clamp makes the parent refuse the change ("100" -> "10").
    // the input must show the committed value right away, not only after blur
    await page.keyboard.type("0")
    await expect(input).toHaveValue("10")
    await expect(input).toHaveAttribute("aria-valuenow", "10")
    await expect(page.getByTestId("parent-value")).toHaveText("10")
  })

  test("rewrites a selection-replaced value the parent refuses", async ({ page }) => {
    await goto(page)
    const input = page.getByTestId("input")

    await input.click()
    await page.keyboard.type("10")
    await expect(input).toHaveValue("10")

    // replace the whole text with a value the parent clamps back to "10"
    await input.selectText()
    await page.keyboard.type("99")
    await expect(input).toHaveValue("10")
    await expect(page.getByTestId("parent-value")).toHaveText("10")
  })
})
