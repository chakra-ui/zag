import { test, expect } from "@playwright/test"
import { testid, a11y } from "./__utils"

const item = (id: string) => ({
  trigger: testid(`${id}:trigger`),
  content: testid(`${id}:content`),
})

const home = item("home")
const about = item("about")
const contact = item("contact")

test.describe("accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accordion")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test.describe("single / keyboard", () => {
    test("on `ArrowDown`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(home.trigger)
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(about.trigger)).toBeFocused()
    })

    test("on `ArrowUp`: should move focus to the previous trigger", async ({ page }) => {
      await page.focus(home.trigger)
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowUp")
      await expect(page.locator(home.trigger)).toBeFocused()
    })

    test("on `Home`: should move focus to the first trigger", async ({ page }) => {
      await page.focus(about.trigger)
      await page.keyboard.press("Home")
      await expect(page.locator(home.trigger)).toBeFocused()
    })

    test("on `End`: should move focus to the last trigger", async ({ page }) => {
      await page.focus(home.trigger)
      await page.keyboard.press("End")
      await expect(page.locator(contact.trigger)).toBeFocused()
    })
  })

  test.describe("single / pointer", () => {
    test("should show content", async ({ page }) => {
      await page.click(home.trigger)
      await expect(page.locator(home.content)).toBeVisible()
    })

    test("then clicking the same trigger again: should not close the content", async ({ page }) => {
      await page.click(home.trigger)
      await page.click(home.trigger)
      await expect(page.locator(home.content)).toBeVisible()
    })

    test("then clicking another trigger: should close the previous content", async ({ page }) => {
      await page.click(home.trigger)
      await page.click(about.trigger)
      await expect(page.locator(about.content)).toBeVisible()
      await expect(page.locator(home.content)).not.toBeVisible()
    })
  })

  test.describe("multiple / keyboard", () => {
    test.beforeEach(async ({ page }) => {
      await page.check(testid("multiple"))
    })

    test("on `ArrowDown`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(home.trigger)
      await page.keyboard.press("Enter")

      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")

      await expect(page.locator(about.content)).toBeVisible()
      await expect(page.locator(home.content)).toBeVisible()
    })
  })

  test.describe("multiple / pointer", () => {
    test.beforeEach(async ({ page }) => {
      await page.check(testid("multiple"))
    })

    test("then clicking another trigger: should close the previous content", async ({ page }) => {
      await page.click(home.trigger)
      await page.click(about.trigger)
      await expect(page.locator(about.content)).toBeVisible()
      await expect(page.locator(home.content)).toBeVisible()
    })
  })
})
