import { expect, test } from "@playwright/test"
import { a11y, controls, testid, clickOutside } from "./__utils"

const input = testid("input")
const inc = testid("inc-button")
const dec = testid("dec-button")
const scrubber = testid("scrubber")

test.describe("number input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/number-input")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test.describe("when typing into the input", () => {
    test("should allow empty string value", async ({ page }) => {
      await page.focus(input)
      await page.type(input, "12")

      await page.keyboard.press("Backspace")
      await page.keyboard.press("Backspace")

      await expect(page.locator(input)).toHaveValue("")
    })

    test("should clamp value when blurred", async ({ page }) => {
      await page.focus(input)
      await page.type(input, "200")
      await expect(page.locator(input)).toHaveAttribute("aria-invalid", "true")

      await clickOutside(page)
      await expect(page.locator(input)).toHaveValue("100")
    })
  })

  test.describe("when using keyboard arrow in the input", () => {
    test("should increment the value", async ({ page }) => {
      await page.type(input, "5")
      await page.keyboard.press("ArrowUp")
      await expect(page.locator(input)).toHaveValue("6")
    })

    test("should decrement the value", async ({ page }) => {
      await page.type(input, "5")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(input)).toHaveValue("3")
    })

    test("should for home/end keys", async ({ page }) => {
      await page.type(input, "5")
      await page.keyboard.press("Home")
      await expect(page.locator(input)).toHaveValue("0")
      await page.keyboard.press("End")
      await expect(page.locator(input)).toHaveValue("100")
    })

    test("should change 10 steps on shift arrow", async ({ page }) => {
      await page.type(input, "0")
      await page.keyboard.press("ArrowUp")
      await expect(page.locator(input)).toHaveValue("1")
      await page.keyboard.press("Shift+ArrowUp")
      await expect(page.locator(input)).toHaveValue("11")
      await page.keyboard.press("Shift+ArrowDown")
      await expect(page.locator(input)).toHaveValue("1")
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(input)).toHaveValue("0")
    })

    test("should change for 0.1 steps", async ({ page }) => {
      await controls(page).num("step", "0.1")
      await controls(page).num("precision", "2")

      await page.type(input, "0.10")
      await page.keyboard.press("Control+ArrowUp")
      await expect(page.locator(input)).toHaveValue("0.11")
      await page.keyboard.press("Control+ArrowDown")
      await expect(page.locator(input)).toHaveValue("0.10")

      await page.keyboard.press("ArrowDown")
      await expect(page.locator(input)).toHaveValue("0.00")
    })

    test("should clear input if invalid `e` is typed", async ({ page }) => {
      await page.type(input, "e")
      await clickOutside(page)
      await expect(page.locator(input)).toHaveValue("")

      await page.type(input, "1e20")
      await clickOutside(page)
      await expect(page.locator(input)).toHaveValue("100")
    })
  })

  test.describe.skip("when using the spinner", () => {
    const tick = (n: number) => 50 * n + 300

    test("should spin value on increment long press", async ({ page }) => {
      const inc_btn = page.locator(inc)

      await inc_btn.dispatchEvent("pointerdown")
      await page.waitForTimeout(tick(10))
      await inc_btn.dispatchEvent("pointerup")

      await expect(page.locator(input)).toHaveValue("11")
    })

    test("should spin value on decrement long press", async ({ page }) => {
      await page.type(input, "20")

      const dec_btn = page.locator(dec)

      await dec_btn.dispatchEvent("pointerdown")
      await page.waitForTimeout(tick(10))
      await dec_btn.dispatchEvent("pointerup")

      await expect(page.locator(input)).toHaveValue("10")
    })
  })

  test.describe("when using scrubber", () => {
    test("should increment on left mouse movement", async ({ page }) => {
      const scrubber_btn = page.locator(scrubber)
      const bbox = await scrubber_btn.boundingBox()
      const midX = bbox.x + bbox.width / 2
      const midY = bbox.y + bbox.height / 2

      await scrubber_btn.dispatchEvent("mousedown")

      await page.mouse.move(midX + 10, midY, { steps: 11 })

      await expect(page.locator(input)).toHaveValue("10")
      await page.mouse.up()
    })
  })
})
