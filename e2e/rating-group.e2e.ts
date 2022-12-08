import { expect, test, Locator, Page } from "@playwright/test"
import { a11y, controls as testControls, part } from "./__utils"

const controls = part("controls")
const hiddenInput = part("hidden-input")
const item = part("item")

const getRating = (page: Page, value: number) => {
  return page.locator(item).nth(value - 1)
}

const expectToBeHighlighted = (el: Locator) => {
  return expect(el).toHaveAttribute("data-highlighted", "")
}

const expectToBeDisabled = (el: Locator) => {
  return expect(el).toHaveAttribute("data-disabled", "")
}

const pointerover = (el: Locator) => {
  el.hover()
  return el.dispatchEvent("pointermove", { button: 0 })
}

test.describe("rating / pointer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rating")
  })

  test("should be accessible", async ({ page }) => {
    await a11y(page)
  })

  test("should set value when item is clicked", async ({ page }) => {
    await getRating(page, 4).click()
    await expect(page.locator(hiddenInput)).toHaveValue("4")
  })

  test("highlight when hovered", async ({ page }) => {
    const el = getRating(page, 4)

    await pointerover(el)
    await expectToBeHighlighted(el)

    // hover out
    page.hover("main")
    await expectToBeHighlighted(getRating(page, 3))

    await pointerover(el)
    el.click()
    await expect(page.locator(hiddenInput)).toHaveValue("4")
  })
})

test.describe("rating / properties", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rating")
  })

  test("should not be selectable when disabled", async ({ page }) => {
    await testControls(page).bool("disabled")
    await expectToBeDisabled(page.locator(controls))
    const items = page.locator(item)
    const isAllItemsDisabled = await items.evaluateAll((items) => items.every((item) => item.dataset.disabled === ""))
    expect(isAllItemsDisabled).toBeTruthy()
  })

  test("should not be selectable when is readonly", async ({ page }) => {
    await testControls(page).bool("readOnly")
    const items = page.locator(item)
    const isAllItemsReadonly = await items.evaluateAll((items) => items.every((item) => item.dataset.readonly === ""))
    expect(isAllItemsReadonly).toBeTruthy()
  })
})

test.describe("rating / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rating")
    await page.click("main")
  })

  test("should select value on arrow left/right", async ({ page }) => {
    await page.keyboard.press("Tab")
    await expect(getRating(page, 3)).toBeFocused()

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await expect(getRating(page, 4)).toBeFocused()

    await page.keyboard.press("ArrowLeft")
    await expect(getRating(page, 3)).toBeFocused()
  })

  test("should select value on arrow home/end", async ({ page }) => {
    await page.keyboard.press("Tab")
    await expect(getRating(page, 3)).toBeFocused()

    await page.keyboard.press("Home")
    await expect(getRating(page, 1)).toBeFocused()
    await expectToBeHighlighted(getRating(page, 1))

    await page.keyboard.press("End")
    await expect(getRating(page, 5)).toBeFocused()
    await expectToBeHighlighted(getRating(page, 5))
  })
})
