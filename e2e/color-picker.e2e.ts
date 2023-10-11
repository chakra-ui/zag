import { expect, test } from "@playwright/test"
import { a11y, testid } from "./__utils"

// const readOnlySwatch = testid("readonly-swatch")
// const clickableSwatch1 = testid("clickable-swatch-1")
// const clickableSwatch2 = testid("clickable-swatch-2")
// const value = testid("value")
// const channelInputHex = "[data-part=channel-input][data-channel=hex]"

test.describe("color-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/color-picker")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".color-picker")
  })

  test("click on trigger should open picker", async ({ page }) => {})

  test("[form] should reset value to inital on reset", async ({ page }) => {})

  test("[form] should save to form data on submit", async ({ page }) => {})

  test("should submit on pressing enter", async ({ page }) => {})

  test("[swatch] should set value on click swatch", async ({ page }) => {})

  test("[channel input] should set value from hex channel", async ({ page }) => {})

  test("should not reset hue after saturation is changed", async ({ page }) => {})

  test("should change hue when clicking the hue bar", async () => {})

  test("should change alpha when clicking the alpha bar", async () => {})
})
