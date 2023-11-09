import { expect, test } from "@playwright/test"
import { a11y, testid } from "./_utils"

const item = (id: string) => ({
  tab: testid(`${id}-tab`),
  panel: testid(`${id}-tab-panel`),
})

const nils = item("nils")
const agnes = item("agnes")
const joke = item("joke")

test.describe("tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tabs")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test.describe("in automatic mode", () => {
    test("should select the correct tab on click", async ({ page }) => {
      await page.click(nils.tab)
      await expect(page.locator(nils.panel)).toBeVisible()

      await page.click(agnes.tab)
      await expect(page.locator(agnes.panel)).toBeVisible()

      await page.click(joke.tab)
      await expect(page.locator(joke.panel)).toBeVisible()
    })

    test("on `ArrowRight`: should select & focus the next tab", async ({ page }) => {
      await page.focus(nils.tab)
      await page.keyboard.press("ArrowRight")

      await expect(page.locator(agnes.tab)).toBeFocused()
      await expect(page.locator(agnes.panel)).toBeVisible()

      await page.keyboard.press("ArrowRight")
      await expect(page.locator(joke.tab)).toBeFocused()
      await expect(page.locator(joke.panel)).toBeVisible()

      await page.keyboard.press("ArrowRight")
      await expect(page.locator(nils.tab)).toBeFocused()
      await expect(page.locator(nils.panel)).toBeVisible()
    })

    test("on `ArrowLeft`: should select & focus the previous tab", async ({ page }) => {
      await page.focus(nils.tab)
      await page.keyboard.press("ArrowLeft")

      await expect(page.locator(joke.tab)).toBeFocused()
      await expect(page.locator(joke.panel)).toBeVisible()

      await page.keyboard.press("ArrowLeft")
      await expect(page.locator(agnes.tab)).toBeFocused()
      await expect(page.locator(agnes.panel)).toBeVisible()

      await page.keyboard.press("ArrowLeft")
      await expect(page.locator(nils.tab)).toBeFocused()
      await expect(page.locator(nils.panel)).toBeVisible()
    })

    test("on `Home` should select first tab", async ({ page }) => {
      await page.click(joke.tab)
      await page.keyboard.press("Home")

      await expect(page.locator(nils.tab)).toBeFocused()
      await expect(page.locator(nils.panel)).toBeVisible()
    })

    test("on `End` should select last tab", async ({ page }) => {
      await page.focus(nils.tab)
      await page.keyboard.press("End")

      await expect(page.locator(joke.tab)).toBeFocused()
      await expect(page.locator(joke.panel)).toBeVisible()
    })
  })
})
