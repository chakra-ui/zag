import { expect, test } from "@playwright/test"
import { rect } from "./_utils"

const trigger = (id: number) => `[data-scope="popover"][data-part="trigger"][data-value="${id}"]`
const content = '[data-scope="popover"][data-part="content"]'
const positioner = '[data-scope="popover"][data-part="positioner"]'
const closeTrigger = '[data-scope="popover"][data-part="close-trigger"]'

test.describe("popover / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/popover-multiple-trigger")
  })

  test("should open popover from trigger", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Project Proposal.pdf")
  })

  test("should switch triggers while popover is open", async ({ page }) => {
    // Open from last trigger so it doesn't cover others
    await page.click(trigger(5))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Code Review.md")

    // Click first trigger - popover should show different content
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Project Proposal.pdf")
  })

  test("should reposition when switching triggers", async ({ page }) => {
    // Open from last trigger
    await page.click(trigger(5))
    const pos1 = await rect(page.locator(positioner))

    // Switch to first trigger
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    const pos2 = await rect(page.locator(positioner))

    // Y position should be different
    expect(pos2.y).toBeLessThan(pos1.y)
  })

  test("should close popover on close trigger", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    await page.click(closeTrigger)
    await expect(page.locator(content)).toBeHidden()
  })

  test("should close popover on escape", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
  })
})
