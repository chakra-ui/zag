import { expect, test } from "./_test"

// Playwright locators pierce open shadow roots
test.describe("shadow root", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test.beforeEach(async ({ page }) => {
    await page.goto("/shadow-root")
  })

  test("modal dialog hides content beside it in the shadow root", async ({ page }) => {
    const hiddenAncestor = "xpath=ancestor-or-self::*[@aria-hidden='true']"
    const sibling = page.getByText("Inside the shadow root").locator(hiddenAncestor)
    const outside = page.getByText("Outside the shadow root").locator(hiddenAncestor)

    await page.getByRole("button", { name: "Open dialog" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByPlaceholder("Name")).toBeFocused()
    await expect(sibling).toHaveCount(1)
    await expect(outside).toHaveCount(1)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toBeHidden()
    await expect(page.getByRole("button", { name: "Open dialog" })).toBeFocused()
    await expect(sibling).toHaveCount(0)
    await expect(outside).toHaveCount(0)
  })

  test("menu closes on a click elsewhere in the shadow root", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).click()
    await expect(page.getByRole("menu")).toBeVisible()

    await page.getByText("Inside the shadow root").click()
    await expect(page.getByRole("menu")).toBeHidden()
  })

  test("select picks an item with the keyboard", async ({ page }) => {
    const trigger = page.getByRole("combobox", { name: "Country" })
    await trigger.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("listbox")).toBeVisible()

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("listbox")).toBeHidden()
    await expect(trigger).not.toHaveText("Select")
    await expect(trigger).toBeFocused()
  })

  test("combobox filters and selects", async ({ page }) => {
    const input = page.getByRole("combobox", { name: "Fruit" })
    await input.click()
    await input.pressSequentially("ban")
    await expect(page.getByRole("option").first()).toBeVisible()

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(input).not.toHaveValue("ban")
  })
})
