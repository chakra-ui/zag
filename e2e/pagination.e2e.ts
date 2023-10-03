import { expect, test } from "@playwright/test"
import { a11y, part, testid } from "./__utils"

const prevButton = part("prev-trigger")
const nextButton = part("next-trigger")
const item = (page: number) => testid(`item-${page}`)

const item2 = item(2)
const item5 = item(5)

test.beforeEach(async ({ page }) => {
  await page.goto("/pagination")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page)
})

test("should update page when item is clicked", async ({ page }) => {
  await page.click(item2)
  await expect(page.locator(item2)).toHaveAttribute("aria-current", "page")
  await page.click(item5)
  await expect(page.locator(item5)).toHaveAttribute("data-selected", "")
})

test("should update page when next button is clicked", async ({ page }) => {
  await page.click(nextButton)
  await expect(page.locator(item2)).toHaveAttribute("aria-current", "page")
  await page.click(nextButton)
  await page.click(nextButton)
  await page.click(nextButton)
  await page.click(item5)
  await expect(page.locator(item5)).toHaveAttribute("data-selected", "")
})

test("should update page when prev button is clicked", async ({ page }) => {
  await page.click(nextButton)
  await page.click(nextButton)
  await page.click(nextButton)
  await page.click(nextButton)
  await expect(page.locator(item5)).toHaveAttribute("data-selected", "")
  await page.click(nextButton)
  await page.click(prevButton)
  await expect(page.locator(item5)).toHaveAttribute("data-selected", "")
  await page.click(prevButton)
  await page.click(prevButton)
  await page.click(prevButton)
  await expect(page.locator(item2)).toHaveAttribute("aria-current", "page")
})

test("should call onChange when item is clicked", async ({ page }) => {
  const onChangeCallbackParams = page.waitForEvent("console")
  await page.click(item2)
  expect((await onChangeCallbackParams).text()).toContain("page: 2")
})

test("should call onChange when next button is clicked", async ({ page }) => {
  const onChangeCallbackParams = page.waitForEvent("console")
  await page.click(nextButton)
  expect((await onChangeCallbackParams).text()).toContain("page: 2")
})

test("should call onChange when prev button is clicked", async ({ page }) => {
  await page.click(item5)

  const onChangeCallbackParams = page.waitForEvent("console")
  await page.click(prevButton)
  expect((await onChangeCallbackParams).text()).toContain("page: 4")
})
