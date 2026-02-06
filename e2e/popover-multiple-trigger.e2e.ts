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

  test("should open popover with Enter key", async ({ page }) => {
    await page.locator(trigger(2)).focus()
    await page.keyboard.press("Enter")
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Budget 2024.xlsx")
  })

  test("should open popover with Space key", async ({ page }) => {
    await page.locator(trigger(3)).focus()
    await page.keyboard.press(" ")
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Meeting Notes.docx")
  })

  test("should return focus to correct trigger after keyboard navigation", async ({ page }) => {
    // Focus first trigger, tab to second, open with Enter
    await page.locator(trigger(1)).focus()
    await page.keyboard.press("Tab")
    await expect(page.locator(trigger(2))).toBeFocused()

    await page.keyboard.press("Enter")
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Budget 2024.xlsx")

    // Close and verify focus returns to trigger 2
    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(trigger(2))).toBeFocused()
  })
})
