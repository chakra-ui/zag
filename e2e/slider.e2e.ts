import { expect, test } from "@playwright/test"
import { testid, a11y } from "./__utils"

const output = testid("output")
const thumb = testid("thumb")
const track = testid("track")

test.describe("slider", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/slider")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("[keyboard] should work with arrow left/right keys", async ({ page }) => {
    await page.focus(thumb)

    await page.keyboard.press("ArrowRight")
    await expect(page.locator(output)).toHaveText("1")

    await page.keyboard.press("ArrowRight")
    await expect(page.locator(output)).toHaveText("2")
  })

  test("[keyboard] should work with home/end keys", async ({ page }) => {
    await page.focus(thumb)

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    await page.keyboard.press("Home")
    await expect(page.locator(output)).toHaveText("0")

    await page.keyboard.press("End")
    await expect(page.locator(output)).toHaveText("100")
  })

  test("[keyboard] should work with shift key", async ({ page }) => {
    await page.focus(thumb)

    await page.keyboard.press("Shift+ArrowRight")
    await expect(page.locator(output)).toHaveText("10")

    await page.keyboard.press("Shift+ArrowLeft")
    await expect(page.locator(output)).toHaveText("0")
  })

  test("[keyboard] should work with page up/down keys", async ({ page }) => {
    await page.focus(thumb)

    await page.keyboard.press("PageUp")
    await expect(page.locator(output)).toHaveText("10")

    await page.keyboard.press("PageDown")
    await expect(page.locator(output)).toHaveText("0")
  })

  test("[pointer] should set value on click track", async ({ page }) => {
    const bbox = await page.locator(track).boundingBox()
    await page.locator(track).dispatchEvent("pointerdown", {
      button: 0,
      clientY: bbox.y + bbox.height / 2,
      clientX: bbox.x + bbox.width * 0.8,
    })
    await expect(page.locator(output)).toHaveText("80")
  })

  test("[pointer] should set the value on drag", async ({ page }) => {
    const el = page.locator(track)
    const bbox = await el.boundingBox()
    await el.dispatchEvent("pointerdown", {
      button: 0,
      clientY: bbox.y + bbox.height / 2,
      clientX: bbox.x + bbox.width * 0.8,
    })
    await expect(page.locator(output)).toHaveText("80")
    await page.mouse.move(bbox.x + bbox.width * 0.9, bbox.y + bbox.height / 2)
    await page.mouse.up()
    await expect(page.locator(output)).toHaveText("90")
  })
})
