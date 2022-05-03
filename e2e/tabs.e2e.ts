import { expect, test } from "@playwright/test"
import { a11y, setup } from "./test-utils"

const item = (id: string) => ({
  tab: setup(`${id}-tab`),
  panel: setup(`${id}-tab-panel`),
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
      await page.click(nils.tab.id)
      await expect(nils.panel.el(page)).toBeVisible()

      await page.click(agnes.tab.id)
      await expect(agnes.panel.el(page)).toBeVisible()

      await page.click(joke.tab.id)
      await expect(joke.panel.el(page)).toBeVisible()
    })

    test("on `ArrowRight`: should select & focus the next tab", async ({ page }) => {
      await page.focus(nils.tab.id)
      await page.keyboard.press("ArrowRight")

      await expect(agnes.tab.el(page)).toBeFocused()
      await expect(agnes.panel.el(page)).toBeVisible()

      await page.keyboard.press("ArrowRight")
      await expect(joke.tab.el(page)).toBeFocused()
      await expect(joke.panel.el(page)).toBeVisible()

      await page.keyboard.press("ArrowRight")
      await expect(nils.tab.el(page)).toBeFocused()
      await expect(nils.panel.el(page)).toBeVisible()
    })

    test("on `ArrowLeft`: should select & focus the previous tab", async ({ page }) => {
      await page.focus(nils.tab.id)
      await page.keyboard.press("ArrowLeft")

      await expect(joke.tab.el(page)).toBeFocused()
      await expect(joke.panel.el(page)).toBeVisible()

      await page.keyboard.press("ArrowLeft")
      await expect(agnes.tab.el(page)).toBeFocused()
      await expect(agnes.panel.el(page)).toBeVisible()

      await page.keyboard.press("ArrowLeft")
      await expect(nils.tab.el(page)).toBeFocused()
      await expect(nils.panel.el(page)).toBeVisible()
    })

    test("on `Home` should select first tab", async ({ page }) => {
      await page.click(joke.tab.id)
      await page.keyboard.press("Home")

      await expect(nils.tab.el(page)).toBeFocused()
      await expect(nils.panel.el(page)).toBeVisible()
    })

    test("on `End` should select last tab", async ({ page }) => {
      await page.focus(nils.tab.id)
      await page.keyboard.press("End")

      await expect(joke.tab.el(page)).toBeFocused()
      await expect(joke.panel.el(page)).toBeVisible()
    })
  })
})
