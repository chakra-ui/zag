import { expect, test, type Page } from "@playwright/test"

async function goto(page: Page, query = "") {
  await page.goto(`/tabs/with-link${query}`)
  await expect(page.locator("main.tabs")).toHaveAttribute("data-ready", "true")
}

test.describe("tabs with links", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test("API selection does not navigate", async ({ page }) => {
    await goto(page)
    const url = page.url()

    await page.getByRole("button", { name: "Select Agnes with API" }).click()

    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page).toHaveURL(url)
  })

  test("controlled prop changes do not navigate", async ({ page }) => {
    await goto(page, "?controlled=true")
    const url = page.url()

    await page.getByRole("button", { name: "Select Joke with prop" }).click()

    await expect(page.getByTestId("value")).toHaveText("joke")
    await expect(page).toHaveURL(url)
  })

  test("pointer activation selects and follows the link", async ({ page }) => {
    await goto(page)

    await page.getByRole("tab").nth(1).click()

    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page).toHaveURL(/#agnes$/)
  })

  test("automatic keyboard activation follows the link", async ({ page }) => {
    await goto(page, "?automatic=true")
    await page.getByRole("tab").first().focus()

    await page.keyboard.press("ArrowRight")

    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page).toHaveURL(/#agnes$/)
  })

  test("automatic keyboard navigation can be canceled", async ({ page }) => {
    await goto(page, "?automatic=true&native=true&cancel=true")
    const url = page.url()
    await page.getByRole("tab").first().focus()

    await page.keyboard.press("ArrowRight")

    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page).toHaveURL(url)
  })

  test("manual keyboard navigation follows the link only on Enter", async ({ page }) => {
    await goto(page, "?native=true")
    const url = page.url()
    await page.getByRole("tab").first().focus()

    await page.keyboard.press("ArrowRight")
    await expect(page.getByTestId("value")).toHaveText("nils")
    await expect(page).toHaveURL(url)

    await page.keyboard.press("Enter")
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page).toHaveURL(/#agnes$/)
  })
})
