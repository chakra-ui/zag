import { expect, test, type Page } from "@playwright/test"

async function goto(page: Page, url: string) {
  await page.goto(url)
  await expect(page.locator("main.tabs")).toHaveAttribute("data-ready", "true")
}

test.describe("tabs with links", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  for (const controlled of [false, true]) {
    test.describe(controlled ? "controlled" : "uncontrolled", () => {
      test.beforeEach(async ({ page }) => {
        await goto(page, `/tabs/links${controlled ? "?controlled=true" : ""}`)
      })

      test("API selection does not click or navigate", async ({ page }) => {
        const url = page.url()
        await page
          .getByRole("tab")
          .nth(1)
          .evaluate((el) => el.setAttribute("href", "/tabs/links?destination=agnes"))
        await page.getByRole("button", { name: "Select Agnes with API" }).click()
        await expect(page.getByTestId("value")).toHaveText("agnes")
        await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true")
        await expect(page.getByRole("tabpanel")).toBeVisible()
        await expect(page.getByTestId("clicks")).toHaveText("0")
        await expect(page).toHaveURL(url)
      })

      for (const [direction, value] of [
        ["next", "agnes"],
        ["previous", "joke"],
      ]) {
        test(`${direction} API selection does not navigate`, async ({ page }) => {
          const url = page.url()
          await page.getByRole("button", { name: `Select ${direction} with API` }).click()
          await expect(page.getByTestId("value")).toHaveText(value)
          await expect(page.getByTestId("clicks")).toHaveText("0")
          await expect(page).toHaveURL(url)
        })
      }

      test("pointer activation clicks once and follows the link", async ({ page }) => {
        await page.getByRole("tab").nth(1).click()
        await expect(page.getByTestId("value")).toHaveText("agnes")
        await expect(page.getByTestId("clicks")).toHaveText("1")
        await expect(page).toHaveURL(/#agnes$/)
      })

      test("automatic keyboard activation follows links", async ({ page }) => {
        await page.getByRole("tab").first().focus()
        for (const [key, value] of [
          ["ArrowRight", "agnes"],
          ["End", "joke"],
          ["Home", "nils"],
          ["ArrowLeft", "joke"],
        ]) {
          await page.keyboard.press(key)
          await expect(page.getByTestId("value")).toHaveText(value)
          await expect(page).toHaveURL(new RegExp(`#${value}$`))
        }
        await expect(page.getByTestId("clicks")).toHaveText("4")
      })
    })
  }

  test("controlled prop sync after keyboard activation does not navigate", async ({ page }) => {
    await goto(page, "/tabs/links?controlled=true")
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/#agnes$/)
    const url = page.url()
    await page.getByRole("button", { name: "Select Joke with prop" }).click()
    await expect(page.getByTestId("value")).toHaveText("joke")
    await expect(page).toHaveURL(url)
  })

  for (const activation of ["pointer", "keyboard"]) {
    test(`${activation} navigation can be canceled by a delegated handler`, async ({ page }) => {
      await goto(page, "/tabs/links?cancel=true")
      const url = page.url()
      if (activation === "pointer") {
        await page.getByRole("tab").nth(1).click()
      } else {
        await page.getByRole("tab").first().focus()
        await page.keyboard.press("ArrowRight")
      }
      await expect(page.getByTestId("value")).toHaveText("agnes")
      await expect(page.getByTestId("clicks")).toHaveText("1")
      await expect(page).toHaveURL(url)
    })
  }

  test("manual activation only follows the link on Enter", async ({ page }) => {
    await goto(page, "/tabs/links?manual=true")
    const url = page.url()
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("tab").nth(1)).toBeFocused()
    await expect(page.getByTestId("value")).toHaveText("nils")
    await expect(page).toHaveURL(url)
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("clicks")).toHaveText("1")
    await expect(page).toHaveURL(/#agnes$/)
  })

  test("keyboard activation does not toggle deselectable tabs twice", async ({ page }) => {
    await goto(page, "/tabs/links?deselectable=true")
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("clicks")).toHaveText("1")
    await page.getByRole("tab").nth(1).click()
    await expect(page.getByTestId("value")).toHaveText("none")
    await expect(page.getByTestId("clicks")).toHaveText("2")
  })

  test("navigate=null selects with the keyboard without following the link", async ({ page }) => {
    await goto(page, "/tabs/links?noNavigate=true")
    const url = page.url()
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("clicks")).toHaveText("0")
    await expect(page).toHaveURL(url)
  })

  test("focusing the selected link does not activate it again", async ({ page }) => {
    await goto(page, "/tabs/links")
    const url = page.url()
    await page.getByRole("tab").first().focus()
    await page.keyboard.press("Home")
    await expect(page.getByRole("tab").first()).toBeFocused()
    await expect(page.getByTestId("value")).toHaveText("nils")
    await expect(page.getByTestId("clicks")).toHaveText("0")
    await expect(page).toHaveURL(url)
  })

  test("custom navigation runs once per activation, never for state sync", async ({ page }) => {
    await goto(page, "/tabs/links?custom=true&controlled=true")
    const url = page.url()
    await page.getByRole("button", { name: "Select Agnes with API" }).click()
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("navigations")).toHaveText("0")
    await page.getByRole("button", { name: "Select Joke with prop" }).click()
    await expect(page.getByTestId("value")).toHaveText("joke")
    await expect(page.getByTestId("navigations")).toHaveText("0")
    await page.getByRole("tab").first().click()
    await expect(page.getByTestId("navigations")).toHaveText("1")
    await page.keyboard.press("ArrowRight")
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("navigations")).toHaveText("2")
    await expect(page.getByTestId("events")).toHaveText(
      "value:agnes,value:nils,navigate:nils,value:agnes,navigate:agnes",
    )
    await expect(page).toHaveURL(url)
  })

  test("a failed custom navigation does not fall back to browser navigation", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await goto(page, "/tabs/links?custom=true&throwNavigate=true")
    const url = page.url()
    await page.getByRole("tab").nth(1).click()
    await expect(page.getByTestId("value")).toHaveText("agnes")
    await expect(page.getByTestId("events")).toHaveText("value:agnes,navigate:agnes")
    await expect.poll(() => errors).toContain("Navigation failed")
    await expect(page).toHaveURL(url)
  })
})
