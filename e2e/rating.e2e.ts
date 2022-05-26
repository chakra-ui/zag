import { expect, test, Locator } from "@playwright/test"
import { controls, part } from "./__utils"

const itemGroup = part("item-group")
const input = part("input")
const item = part("item")

const expectToBeHighlighted = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-highlighted", "")
}

const expectToBeDisabled = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-disabled", "")
}

test.describe("rating", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rating")
  })

  test("should have no accessibility violation", async ({ page }) => {
    // await a11y(page)
  })

  test("should have right number of items provided by max", async ({ page }) => {
    await controls(page).num("max", "6")
    const items = await page.locator('[data-part="item"]')
    const itemCount = await items.count()
    await expect(itemCount).toBe(6)
  })

  test("should set value when item is clicked", async ({ page }) => {
    await page.locator(item).nth(3).click()

    await expect(page.locator(input)).toHaveValue("4")
  })

  test("should be highlighted correctly", async ({ page }) => {
    await page.locator(item).nth(3).hover()

    await expectToBeHighlighted(page.locator(item).nth(3))
  })

  test("should not be selectable when disabled", async ({ page }) => {
    await controls(page).bool("disabled")
    await expectToBeDisabled(page.locator(itemGroup))

    const items = page.locator(item)
    const isAllItemsDisabled = await items.evaluateAll((items) => items.every((item) => item.dataset.disabled === ""))
    await expect(isAllItemsDisabled).toBeTruthy()
  })

  test("should not be selectable when is readonly", async ({ page }) => {
    await controls(page).bool("readonly")

    const items = page.locator(item)
    const isAllItemsReadonly = await items.evaluateAll((items) => items.every((item) => item.dataset.readonly === ""))
    await expect(isAllItemsReadonly).toBeTruthy()
  })
})
