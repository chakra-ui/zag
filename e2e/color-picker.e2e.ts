import { test as base, expect, type Locator, type Page } from "@playwright/test"
import { a11y, clickOutside, part } from "./_utils"

/* -----------------------------------------------------------------------------
 * Setup
 * -----------------------------------------------------------------------------*/

class Parts {
  constructor(private readonly page: Page) {}
  get trigger(): Locator {
    return this.page.locator(part("trigger"))
  }
  get content(): Locator {
    return this.page.locator(part("content"))
  }
  get input(): Locator {
    return this.page.locator(`[data-part=control] [data-channel=hex]`)
  }
  get areaThumb(): Locator {
    return this.page.locator(part("area-thumb"))
  }
  getChannelInput(channel: string) {
    return this.page.locator(`[data-part=channel-input][data-channel=${channel}]`)
  }
  getChannelThumb(channel: string) {
    return this.page.locator(`[data-part=channel-slider-thumb][data-channel=${channel}]`)
  }
  getChannelSlider(channel: string) {
    return this.page.locator(`[data-part=channel-slider][data-channel=${channel}]`)
  }
  get swatchTriggers() {
    return this.page.locator(part("swatch-trigger"))
  }
  get resetButton() {
    return this.page.getByRole("button", { name: "Reset" })
  }
  get valueText() {
    return this.page.getByTestId("value-text").first()
  }
}

const INITIAL_VALUE = "#FF0000"
const PINK_VALUE = "#FFC0CB"

const test = base.extend<{ parts: Parts }>({
  parts: async ({ page }, use) => {
    await use(new Parts(page))
  },
})

/* -----------------------------------------------------------------------------
 * Tests
 * -----------------------------------------------------------------------------*/

test.describe("color-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/color-picker")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".color-picker")
  })

  test("[closed] typing the same native css colors switch show hex", async ({ parts }) => {
    await parts.input.fill("red")
    await parts.input.press("Enter")
    await parts.input.blur()
    await expect(parts.input).toHaveValue(INITIAL_VALUE)
  })

  test("[closed] typing different native css colors should update color", async ({ parts }) => {
    await parts.input.fill("pink")
    await parts.input.press("Enter")
    await parts.input.blur()
    await expect(parts.input).toHaveValue(PINK_VALUE)
  })

  test("[closed] typing in alpha should update color", async ({ parts, page }) => {
    const alpha = parts.getChannelInput("alpha").first()
    await alpha.fill("0.3")
    await page.keyboard.press("Enter")

    await expect(parts.valueText).toContainText("hsla(0, 100%, 50%, 0.3)")
  })

  test("click on trigger should open picker", async ({ parts }) => {
    await parts.trigger.click()
    await expect(parts.content).toBeVisible()
  })

  test("should re-focus trigger on outside click", async ({ parts, page }) => {
    await parts.trigger.click()
    await expect(parts.content).toBeVisible()

    await clickOutside(page)
    await expect(parts.trigger).toBeFocused()
  })

  test("opening the picker should focus area", async ({ parts }) => {
    await parts.trigger.click()
    await expect(parts.content).toBeVisible()
    await expect(parts.areaThumb).toBeFocused()
  })

  test("keyboard focus movement", async ({ parts, page }) => {
    await parts.trigger.click()
    await expect(parts.content).toBeVisible()
    await expect(parts.areaThumb).toBeFocused()

    await page.keyboard.press("Tab")
    await expect(parts.getChannelThumb("hue")).toBeFocused()

    await page.keyboard.press("Tab")
    await expect(parts.getChannelThumb("alpha")).toBeFocused()
  })

  test("[swatch] should set value on click swatch", async ({ parts }) => {
    await parts.trigger.click()
    const [swatch] = await parts.swatchTriggers.all()
    await swatch.click()
    const swatchValue = (await swatch.getAttribute("data-value")) ?? ""
    await expect(parts.input).toHaveValue(swatchValue)
  })

  test("[form] should reset value to initial on reset", async ({ parts, page }) => {
    await parts.trigger.click()

    const [swatch] = await parts.swatchTriggers.all()
    await swatch.click()

    await clickOutside(page)
    await parts.resetButton.click()

    await expect(parts.input).toHaveValue(INITIAL_VALUE)
  })

  test("hsl channel inputs should work as expected", async ({ page, parts }) => {
    await parts.trigger.click()

    const hue = parts.getChannelInput("hue")
    const saturation = parts.getChannelInput("saturation")
    const lightness = parts.getChannelInput("lightness")
    const alpha = parts.getChannelInput("alpha").nth(1)

    await hue.fill("20")
    await page.keyboard.press("Enter")
    await expect(parts.valueText).toContainText("hsla(20, 100%, 50%, 1)")

    await saturation.fill("56")
    await page.keyboard.press("Enter")
    await expect(parts.valueText).toContainText("hsla(20, 56%, 50%, 1)")

    await lightness.fill("78")
    await page.keyboard.press("Enter")
    await expect(parts.valueText).toContainText("hsla(20, 56%, 78%, 1)")

    await alpha.fill("0.5")
    await page.keyboard.press("Enter")
    await expect(parts.valueText).toContainText("hsla(20, 56%, 78%, 0.5)")
  })

  test("[slider] should change hue when clicking the hue bar", async ({ parts }) => {
    await parts.trigger.click()

    const hue = parts.getChannelSlider("hue")
    await hue.click()
    await expect(parts.valueText).not.toContainText("hsla(0, 100%, 50%, 1)")
  })

  test("[slider] should change alpha when clicking the alpha bar", async ({ parts }) => {
    await parts.trigger.click()

    const alpha = parts.getChannelSlider("alpha")
    await alpha.click()
    await expect(parts.valueText).not.toContainText("hsla(0, 100%, 50%, 1)")
  })
})
