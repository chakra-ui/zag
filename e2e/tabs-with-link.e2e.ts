import { expect, test, type Page } from "@playwright/test"

const navigations = "[data-testid=navigations]"

async function goto(page: Page, query = "") {
  await page.goto(`/tabs/with-link${query}`)
}

test.describe("tabs / with-link", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test("api.setValue selects without navigating", async ({ page }) => {
    await goto(page)
    await page.click("[data-testid=set-value]")

    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("none")
    await expect(page).toHaveURL(/\/tabs\/with-link$/)
  })

  test("controlled value sync selects without navigating", async ({ page }) => {
    await goto(page, "?controlled=true")
    await page.click("[data-testid=set-prop]")

    await expect(page.getByRole("tab").nth(2)).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("none")
    await expect(page).toHaveURL(/\/tabs\/with-link\?controlled=true$/)
  })

  test("selectNext selects without navigating", async ({ page }) => {
    await goto(page)
    await page.click("[data-testid=select-next]")

    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("none")
    await expect(page).toHaveURL(/\/tabs\/with-link$/)
  })

  test("clicking a trigger follows the link", async ({ page }) => {
    await goto(page)
    await page.getByRole("tab").nth(1).click()

    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("agnes")
    await expect(page).toHaveURL(/#agnes$/)
  })

  test("keyboard activation follows the link", async ({ page }) => {
    await goto(page)
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")

    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(page).toHaveURL(/#agnes$/)
  })

  test("controlled sync after keyboard activation navigates once", async ({ page }) => {
    await goto(page, "?controlled=true")
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")

    await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(page).toHaveURL(/#agnes$/)
    await expect(page.locator(navigations)).toHaveText("agnes")
  })

  test("a rejected click in a locked controlled setup does not follow the link", async ({ page }) => {
    await goto(page, "?controlled=locked")
    await page.getByRole("tab").nth(1).click()

    await expect(page.getByRole("tab").first()).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("none")
  })

  test("focusing the selected tab does not navigate again", async ({ page }) => {
    await goto(page)
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("Home")

    await expect(page.getByRole("tab").first()).toBeFocused()
    await expect(page.getByRole("tab").first()).toHaveAttribute("aria-selected", "true")
    await expect(page.locator(navigations)).toHaveText("none")
    await expect(page).toHaveURL(/\/tabs\/with-link$/)
  })
})
