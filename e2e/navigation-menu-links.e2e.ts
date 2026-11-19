import { expect, test } from "./_test"

// Solid Router 2 claims every `a[href]` and writes aria-current="page" when the URL matches, ignoring the hash,
// so every same-page "#..." link in this example reads as current there.
const routerOwnsAriaCurrent = process.env.FRAMEWORK === "solid"

test.describe("navigation-menu links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/navigation-menu/links")
  })

  test("closes after picking a link and updates the current page", async ({ page }) => {
    const guides = page.getByRole("button", { name: "Guides" })
    const current = page.getByTestId("current-page")

    await expect(current).toHaveText("Getting started")
    await guides.click()
    await expect(page.getByRole("link", { name: "Styling" })).toBeVisible()

    await page.getByRole("link", { name: "Styling" }).click()
    await expect(page.getByRole("link", { name: "Styling" })).toBeHidden()
    await expect(guides).toHaveAttribute("aria-expanded", "false")
    await expect(current).toHaveText("Styling")

    await page.getByRole("link", { name: "Changelog" }).click()
    await expect(current).toHaveText("Changelog")
  })

  test("marks only the current page with aria-current", async ({ page }) => {
    test.fixme(routerOwnsAriaCurrent, "Solid Router marks same-page hash links as current")

    const guides = page.getByRole("button", { name: "Guides" })
    const changelog = page.getByRole("link", { name: "Changelog" })

    await guides.click()
    await expect(page.getByRole("link", { name: "Getting started" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("link", { name: "Styling" })).not.toHaveAttribute("aria-current", "page")
    await expect(changelog).not.toHaveAttribute("aria-current", "page")

    await page.getByRole("link", { name: "Styling" }).click()
    await guides.click()
    await expect(page.getByRole("link", { name: "Styling" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("link", { name: "Getting started" })).not.toHaveAttribute("aria-current", "page")

    await changelog.click()
    await expect(changelog).toHaveAttribute("aria-current", "page")
  })
})
