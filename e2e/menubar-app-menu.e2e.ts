import { expect, test } from "./_test"

test.describe("menubar app-menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menubar/app-menu")
  })

  test("items show shortcuts, disabled items are skipped, picking one runs it", async ({ page }) => {
    await page.getByRole("menuitem", { name: "File" }).click()
    const save = page.getByRole("menuitem", { name: /^Save/ })
    await expect(save).toContainText("⌘S")
    await expect(page.getByRole("menuitem", { name: /^Export/ })).toHaveAttribute("aria-disabled", "true")

    await save.click()
    await expect(save).toBeHidden()
    await expect(page.getByTestId("last-action")).toHaveText("Last action: Save")

    await page.getByRole("menuitem", { name: "Edit" }).click()
    await expect(page.getByRole("menuitem", { name: /^Redo/ })).toHaveAttribute("aria-disabled", "true")
  })

  test("checkbox items toggle and remember their state", async ({ page }) => {
    const status = page.getByTestId("view-state")
    await expect(status).toHaveText("Line numbers on · Word wrap off · Theme: System")

    await page.getByRole("menuitem", { name: "View" }).click()
    await expect(page.getByRole("menuitemcheckbox", { name: "Show line numbers" })).toHaveAttribute(
      "aria-checked",
      "true",
    )
    await page.getByRole("menuitemcheckbox", { name: "Word wrap" }).click()
    await expect(status).toHaveText("Line numbers on · Word wrap on · Theme: System")

    await page.getByRole("menuitem", { name: "View" }).click()
    await expect(page.getByRole("menuitemcheckbox", { name: "Word wrap" })).toHaveAttribute("aria-checked", "true")
  })

  test("the theme radio group keeps one option checked", async ({ page }) => {
    await page.getByRole("menuitem", { name: "View" }).click()
    await page.getByRole("menuitemradio", { name: "Dark" }).click()
    await expect(page.getByTestId("view-state")).toHaveText("Line numbers on · Word wrap off · Theme: Dark")

    await page.getByRole("menuitem", { name: "View" }).click()
    await expect(page.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
    await expect(page.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "false")
  })
})
