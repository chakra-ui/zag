import { expect, test, Locator } from "@playwright/test"
import { paste, setup, testid } from "./test-utils"

const input = setup("input")

const getTag = (id: string) => setup(`${id}-tag`)
const getClose = (id: string) => setup(`${id}-close-button`)
const getInput = (id: string) => setup(`${id}-input`)

const expectToBeSelected = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-selected", "")
}

test.describe("tags-input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags-input")
  })

  test("should add new tag value", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")
    await expect(getTag("svelte").el(page)).toBeVisible()
    await expect(input.el(page)).toBeEmpty()
    await expect(input.el(page)).toBeFocused()
  })

  test("deletes tag with backspace when input value is empty", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")
    await page.keyboard.press("Backspace")

    await expectToBeSelected(getTag("svelte").el(page))

    await page.keyboard.press("Backspace")

    await expect(getTag("svelte").el(page)).toBeHidden()
    await expect(input.el(page)).toBeFocused()
  })

  test("should navigate tags with arrow keys", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")

    await page.type(input.id, "Solid")
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")

    await expectToBeSelected(getTag("svelte").el(page))

    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await expectToBeSelected(getTag("vue").el(page))

    await page.keyboard.press("ArrowRight")
    await expectToBeSelected(getTag("svelte").el(page))
  })

  test("should clear focused tag on blur", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")

    await page.type(input.id, "Solid")
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.click("body", { force: true })

    const tags = await page.$$("[data-part=tag][data-selected]")
    expect(tags).toHaveLength(0)
  })

  test("removes tag on close button click", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")

    await page.type(input.id, "Solid")
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.click(getClose("svelte").id, { force: true })

    await expect(getTag("svelte").el(page)).toBeHidden()
  })

  test("edit tag with enter key", async ({ page }) => {
    await page.type(input.id, "Svelte")
    await page.keyboard.press("Enter")

    await page.type(input.id, "Solid")
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("Enter")

    await expect(getInput("svelte").el(page)).toBeFocused()
    await expect(getInput("svelte").el(page)).toHaveValue("Svelte")

    await page.type(getInput("svelte").id, "Jenkins")
    await page.keyboard.press("Enter")

    await expectToBeSelected(getTag("jenkins").el(page))
    await expect(getInput("jenkins").el(page)).toBeHidden()

    await expect(input.el(page)).toBeFocused()
  })

  test.only("add tags from paste event", async ({ page }) => {
    await page.check(testid("addOnPaste"))
    await page.focus(input.id)

    await page.$eval(input.id, paste, "Github, Jenkins")

    await expect(getTag("github").el(page)).toBeVisible()
    await expect(getTag("jenkins").el(page)).toBeVisible()
  })
})
