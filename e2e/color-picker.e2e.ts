import { expect, test } from "@playwright/test"
import { a11y, testid } from "./__utils"

const readOnlySwatch = testid("readonly-swatch")
const clickableSwatch1 = testid("clickable-swatch-1")
const clickableSwatch2 = testid("clickable-swatch-2")
const value = testid("value")
const channelInputHex = "[data-part=channel-input][data-channel=hex]"

test.describe("color-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/color-picker")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".color-picker")
  })

  test("[swatch] should change the value if is not readonly", async ({ page }) => {
    await page.click(readOnlySwatch)
    await expect(page.locator(value)).toContainText("hsl(0, 100%, 50%)")
    await page.click(clickableSwatch1)
    await expect(page.locator(value)).toContainText("hsla(0, 85.43%, 70.39%, 1)")
    await page.click(clickableSwatch2)
    await expect(page.locator(value)).toContainText("hsla(215.62, 13.22%, 47.45%, 1)")
  })

  test("[swatch / channel input hex] should change the hex channel input if is not readonly", async ({ page }) => {
    await page.click(readOnlySwatch)
    await expect(page.locator(channelInputHex)).toHaveValue("#FF0000")
    await page.click(clickableSwatch1)
    await expect(page.locator(channelInputHex)).toHaveValue("#F47373")
    await page.click(clickableSwatch2)
    await expect(page.locator(channelInputHex)).toHaveValue("#697689")
  })
})
