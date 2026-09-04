import { expect, test } from "@playwright/test"
import { a11y, mouseSwipe, part } from "./_utils"

test.skip((process.env.FRAMEWORK ?? "react") !== "react", "The wheel-picker example is currently React-only")

test.describe("wheel-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/wheel-picker/basic")
    await page.waitForLoadState("networkidle")
  })

  test("has no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("supports arrow keys and skips disabled items", async ({ page }) => {
    const control = page.locator(part("control"))
    const output = page.getByTestId("value")

    await control.focus()
    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Vue")

    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Svelte")
  })

  test("supports home, end, and typeahead", async ({ page }) => {
    const control = page.locator(part("control"))
    const output = page.getByTestId("value")

    await control.focus()
    await page.keyboard.press("End")
    await expect(output).toHaveText("Selected: Lit")

    await page.keyboard.press("Home")
    await expect(output).toHaveText("Selected: React")

    await page.keyboard.press("s")
    await expect(output).toHaveText("Selected: Svelte")
  })

  test("syncs changes from the hidden select", async ({ page }) => {
    await page.locator('select[name="framework"]').selectOption("solid")
    await expect(page.getByTestId("value")).toHaveText("Selected: Solid")
  })

  test("settles to an item after dragging", async ({ page }) => {
    const control = page.locator(part("control"))
    await mouseSwipe(page, control, "up", 90, 300)
    await expect(control).toHaveAttribute("aria-valuetext", /Svelte|Solid|Preact|Qwik|Lit/)
  })
})

test.describe("wheel-picker examples", () => {
  test("supports a controlled value", async ({ page }) => {
    await page.goto("/wheel-picker/controlled")
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Select Svelte" }).click()

    await expect(page.getByRole("spinbutton", { name: "Framework" })).toHaveAttribute("aria-valuetext", "Svelte")
    await expect(page.getByTestId("value")).toHaveText("Controlled value: Svelte")
  })

  test("coordinates multiple time pickers", async ({ page }) => {
    await page.goto("/wheel-picker/multiple")
    await page.waitForLoadState("networkidle")

    await page.getByRole("spinbutton", { name: "Hour" }).focus()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowDown")

    await expect(page.getByRole("spinbutton", { name: "Meridiem" })).toBeFocused()
    await expect(page.getByTestId("value")).toHaveText("Selected time: 10:42 PM")
  })
})
