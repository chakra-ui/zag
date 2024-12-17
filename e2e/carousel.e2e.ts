import { expect, type Page, test } from "@playwright/test"
import { controls, part } from "./_utils"

const item = part("item")
const itemGroup = part("item-group")
const indicator = part("indicator")
const prevTrigger = part("prev-trigger")
const nextTrigger = part("next-trigger")
const autoplayTrigger = part("autoplay-trigger")

const expectToBeVisible = async (page: Page, index: number) => {
  const items = page.locator(item)
  const targetItem = items.nth(index)

  const [itemGroupBox, targetItemBox] = await Promise.all([
    page.locator(itemGroup).boundingBox(),
    targetItem.boundingBox(),
  ])

  const isVisible =
    targetItemBox &&
    itemGroupBox &&
    targetItemBox.x < itemGroupBox.x + itemGroupBox.width &&
    targetItemBox.x + targetItemBox.width > itemGroupBox.x

  await expect(targetItem).toHaveAttribute("data-inview", "")
  expect(isVisible, `Item at index ${index} should be visible`).toBe(true)
}

const expectNotToBeVisible = async (page: Page, index: number) => {
  const items = page.locator(item)
  const targetItem = items.nth(index)

  const [itemGroupBox, targetItemBox] = await Promise.all([
    page.locator(itemGroup).boundingBox(),
    targetItem.boundingBox(),
  ])

  const isNotVisible =
    targetItemBox &&
    itemGroupBox &&
    (targetItemBox.x >= itemGroupBox.x + itemGroupBox.width || targetItemBox.x + targetItemBox.width <= itemGroupBox.x)
  await expect(targetItem).toHaveAttribute("aria-hidden", "true")
  expect(isNotVisible, `Item at index ${index} should not be visible`).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.goto("/carousel")
})

test("renders carousel with correct number of items", async ({ page }) => {
  const items = page.locator(item)
  await expect(items).toHaveCount(6)
})

test("correct slidesPerPage is visible", async ({ page }) => {
  await expectToBeVisible(page, 0)
  await expectToBeVisible(page, 1)

  await expectNotToBeVisible(page, 2)
})

test("first indicator is active", async ({ page }) => {
  const indicators = page.locator(indicator)
  await expect(indicators.nth(0)).toHaveAttribute("data-current", "")
})

test("Next/Prev buttons navigate carousel", async ({ page }) => {
  const nextButton = page.locator(nextTrigger)
  const prevButton = page.locator(prevTrigger)
  const indicators = page.locator(indicator)
  await expect(prevButton).toBeDisabled()
  await nextButton.click()
  await expect(indicators.nth(1)).toHaveAttribute("data-current", "")
  await expect(prevButton).not.toBeDisabled()
})

test("Autoplay start/stop", async ({ page }) => {
  // Start autoplay
  const autoplayButton = page.locator(autoplayTrigger)
  await autoplayButton.click()
  await expect(autoplayButton).toHaveText("Stop")

  // Wait longer than the autoplay interval, default autoplay interval is ~4000ms
  await page.waitForTimeout(5000)

  const indicators = page.locator(indicator)
  const secondIndicator = indicators.nth(1)
  // Now the carousel should have advanced to the next slide
  await expect(secondIndicator).toHaveAttribute("data-current", "")

  // Stop autoplay
  await autoplayButton.click()
  await expect(autoplayButton).toHaveText("Play")
  // Wait again to ensure no advance happens
  await page.waitForTimeout(5000)

  // Still on slide 2?
  await expect(secondIndicator).toHaveAttribute("data-current", "")
})

test("clicking indicator scrolls to correct slide", async ({ page }) => {
  const indicators = page.locator(indicator)

  // Click on the third indicator
  await indicators.nth(2).click()
  // Wait for scroll to end
  await page.waitForTimeout(1000)

  // Check that the third indicator is now active
  await expect(indicators.nth(2)).toHaveAttribute("data-current", "")
  await expectToBeVisible(page, 4)
  await expectToBeVisible(page, 5)
})

test("scroll to a specific index via button", async ({ page }) => {
  // There's a button that scrolls to slide 5 (index 4)
  const scrollTo4Button = page.getByRole("button", { name: /Scroll to 4/i })
  await scrollTo4Button.click()

  // Wait for scroll to end
  await page.waitForTimeout(1000)

  // The 5th slde should now be visible
  await expectToBeVisible(page, 4)
})

test("Dragging behavior", async ({ page }) => {
  const boundingBox = await page.locator(itemGroup).boundingBox()
  if (!boundingBox) return

  const startX = boundingBox.x + boundingBox.width - 25
  const startY = boundingBox.y + boundingBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()

  await page.mouse.move(boundingBox.width - 25, startY, { steps: 10 })
  await page.mouse.move(startX - 550, startY, { steps: 10 })
  await page.mouse.up()

  await expectToBeVisible(page, 3)
  await expectNotToBeVisible(page, 0)
  await expectNotToBeVisible(page, 1)
})

test("Keyboard navigation", async ({ page }) => {
  const indicators = page.locator(indicator)
  await indicators.nth(0).focus()

  await page.keyboard.press("ArrowRight")
  // Wait for scroll to end
  await page.waitForTimeout(1000)
  await expectToBeVisible(page, 2)
})

test("should loop when enabled", async ({ page }) => {
  await controls(page).bool("loop")
  const prevButton = page.locator(prevTrigger)
  await expect(prevButton).not.toBeDisabled()
  await prevButton.click()
  // Wait for scroll to end
  await page.waitForTimeout(1000)
  await expectToBeVisible(page, 5)
})
