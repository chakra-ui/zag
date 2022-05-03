import { test, expect } from "@playwright/test"
import { testid, a11y, setup } from "./test-utils"

const item = (id: string) => ({
  trigger: setup(`${id}:trigger`),
  content: setup(`${id}:content`),
})

const home = item("home")
const about = item("about")
const contact = item("contact")

test.describe.parallel("accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/accordion")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test.describe("single / keyboard", () => {
    test("on `ArrowDown`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(home.trigger.id)
      await page.keyboard.press("ArrowDown")
      await expect(about.trigger.el(page)).toBeFocused()
    })

    test("on `ArrowUp`: should move focus to the previous trigger", async ({ page }) => {
      await page.focus(home.trigger.id)
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowUp")
      await expect(home.trigger.el(page)).toBeFocused()
    })

    test("on `Home`: should move focus to the first trigger", async ({ page }) => {
      await page.focus(about.trigger.id)
      await page.keyboard.press("Home")
      await expect(home.trigger.el(page)).toBeFocused()
    })

    test("on `End`: should move focus to the last trigger", async ({ page }) => {
      await page.focus(home.trigger.id)
      await page.keyboard.press("End")
      await expect(contact.trigger.el(page)).toBeFocused()
    })
  })

  test.describe("single / pointer", () => {
    test("should show content", async ({ page }) => {
      await page.click(home.trigger.id)
      await expect(home.content.el(page)).toBeVisible()
    })

    test("then clicking the same trigger again: should not close the content", async ({ page }) => {
      await page.click(home.trigger.id)
      await page.click(home.trigger.id)
      await expect(home.content.el(page)).toBeVisible()
    })

    test("then clicking another trigger: should close the previous content", async ({ page }) => {
      await page.click(home.trigger.id)
      await page.click(about.trigger.id)
      await expect(about.content.el(page)).toBeVisible()
      await expect(home.content.el(page)).not.toBeVisible()
    })
  })

  test.describe("multiple / keyboard", () => {
    test.beforeEach(async ({ page }) => {
      await page.check(testid("multiple"))
    })

    test("on `ArrowDown`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(home.trigger.id)
      await page.keyboard.press("Enter")

      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")

      await expect(about.content.el(page)).toBeVisible()
      await expect(home.content.el(page)).toBeVisible()
    })
  })

  test.describe("multiple / pointer", () => {
    test.beforeEach(async ({ page }) => {
      await page.check(testid("multiple"))
    })

    test("then clicking another trigger: should close the previous content", async ({ page }) => {
      await page.click(home.trigger.id)
      await page.click(about.trigger.id)
      await expect(about.content.el(page)).toBeVisible()
      await expect(home.content.el(page)).toBeVisible()
    })
  })
})
