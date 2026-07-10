import { expect, test } from "@playwright/test"
import { a11y, part } from "./_utils"

const trigger = part("trigger")
const content = part("content")
const testText = part("test-text")

test.beforeEach(async ({ page }) => {
  await page.goto("/hover-card/basic")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page, trigger)
})

test("content should be hidden by default", async ({ page }) => {
  await expect(page.locator(content)).not.toBeVisible()
})

test("should be opened after hovering trigger", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should have no accessibility violation in content", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await a11y(page, content)
})

test("should be opened after focusing trigger", async ({ page }) => {
  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should be closed after blurring trigger", async ({ page }) => {
  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.locator(trigger).evaluate((e) => e.blur())
  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should be closed after blurring trigger with keyboard", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.keyboard.press("Tab")

  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should remain open after blurring trigger if pointer opens card", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.locator(trigger).evaluate((e) => e.blur())
  await page.waitForTimeout(500)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(testText)
  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should remain open after moving from trigger to content", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should remain open after moving from content back to trigger", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(trigger)
  await expect(page.locator(content)).toBeVisible()
})

test("should remain open when pointer crosses the gutter gap slowly (trigger to content)", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  const triggerBox = await page.locator(trigger).boundingBox()
  const contentBox = await page.locator(content).boundingBox()
  if (!triggerBox || !contentBox) throw new Error("missing bounding boxes")

  // walk straight down from the trigger into the gutter gap, pausing between
  // steps so the traversal takes longer than the default `closeDelay` (300ms)
  const x = triggerBox.x + triggerBox.width / 2
  const startY = triggerBox.y + triggerBox.height - 1
  const endY = contentBox.y + 1

  await page.mouse.move(x, startY)
  const steps = Math.max(6, Math.ceil(Math.abs(endY - startY) / 2))
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x, startY + ((endY - startY) * i) / steps)
    await page.waitForTimeout(100)
    expect(await page.locator(content).isVisible()).toBe(true)
  }
})

test("should close when pointer leaves the grace area between trigger and content", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  const triggerBox = await page.locator(trigger).boundingBox()
  const contentBox = await page.locator(content).boundingBox()
  if (!triggerBox || !contentBox) throw new Error("missing bounding boxes")

  // move into the gutter gap and linger past the default `closeDelay` (300ms)
  const x = triggerBox.x + triggerBox.width / 2
  const y = (triggerBox.y + triggerBox.height + contentBox.y) / 2
  await page.mouse.move(x, y - 2)
  await page.mouse.move(x, y)
  await page.waitForTimeout(400)
  expect(await page.locator(content).isVisible()).toBe(true)

  // veer away from the trigger and content
  await page.mouse.move(x - 200, y, { steps: 5 })
  await expect(page.locator(content)).toBeHidden()
})

test("should remain open when pointer crosses the gutter gap slowly (content to trigger)", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(content)
  await expect(page.locator(content)).toBeVisible()

  const triggerBox = await page.locator(trigger).boundingBox()
  const contentBox = await page.locator(content).boundingBox()
  if (!triggerBox || !contentBox) throw new Error("missing bounding boxes")

  // walk straight up from the content into the gutter gap, pausing between
  // steps so the traversal takes longer than the default `closeDelay` (300ms)
  const x = triggerBox.x + triggerBox.width / 2
  const startY = contentBox.y + 1
  const endY = triggerBox.y + triggerBox.height - 1

  await page.mouse.move(x, startY)
  const steps = Math.max(6, Math.ceil(Math.abs(endY - startY) / 2))
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x, startY + ((endY - startY) * i) / steps)
    await page.waitForTimeout(100)
    expect(await page.locator(content).isVisible()).toBe(true)
  }
})
