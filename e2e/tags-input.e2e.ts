import { expect, test, type Locator } from "@playwright/test"
import { clickViz, paste, testid } from "./__utils"

const input = testid("input")

const item = (id: string) => ({
  text: id,
  tag: testid(`${id.toLowerCase()}-tag`),
  close: testid(`${id.toLowerCase()}-close-button`),
  input: testid(`${id.toLowerCase()}-input`),
})

const expectToBeHighlighted = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-highlighted", "")
}

test.describe("tags-input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags-input")
  })

  test("should add new tag value", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, "Svelte")
    await page.keyboard.press("Enter")
    await expect(page.locator(svelte.tag)).toBeVisible()
    await expect(page.locator(input)).toBeEmpty()
    await expect(page.locator(input)).toBeFocused()
  })

  test("deletes tag with backspace when input value is empty", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, svelte.text)
    await page.keyboard.press("Enter")
    await page.keyboard.press("Backspace")

    await expectToBeHighlighted(page.locator(svelte.tag))

    await page.keyboard.press("Backspace")

    await expect(page.locator(svelte.tag)).toBeHidden()
    await expect(page.locator(input)).toBeFocused()
  })

  test("should not edit when no tag is focused", async ({ page }) => {
    await clickViz(page)
    //Focus input
    await page.locator(input).focus()
    //Clear Vue
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Delete")
    //Clear React
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Delete")

    await page.keyboard.press("Enter")

    const svelte = item("Svelte")
    await page.type(input, "Svelte")
    await page.keyboard.press("Enter")
    await expect(page.locator(svelte.tag)).toBeVisible()
    await expect(page.locator(input)).toBeEmpty()
    await expect(page.locator(input)).toBeFocused()
  })

  test("should navigate tags with arrow keys", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, svelte.text)
    await page.keyboard.press("Enter")

    const solid = item("Solid")
    await page.type(input, solid.text)
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")

    await expectToBeHighlighted(page.locator(solid.tag))

    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")

    const vue = item("Vue")
    await expectToBeHighlighted(page.locator(vue.tag))

    await page.keyboard.press("ArrowRight")
    await expectToBeHighlighted(page.locator(svelte.tag))
  })

  test("should clear focused tag on blur", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, svelte.text)
    await page.keyboard.press("Enter")

    const solid = item("Solid")
    await page.type(input, solid.text)
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.click("body", { force: true })

    expect(await page.locator("[data-part=item][data-selected]").count()).toBe(0)
  })

  test("removes tag on close button click", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, svelte.text)
    await page.keyboard.press("Enter")

    const solid = item("Solid")
    await page.type(input, solid.text)
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.click(svelte.close, { force: true })

    await expect(page.locator(svelte.tag)).toBeHidden()
  })

  test("edit tag with enter key", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, svelte.text)
    await page.keyboard.press("Enter")

    const solid = item("Solid")
    await page.type(input, solid.text)
    await page.keyboard.press("Enter")

    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("Enter")

    await expect(page.locator(svelte.input)).toBeFocused()
    await expect(page.locator(svelte.input)).toHaveValue("Svelte")

    const jenkins = item("Jenkins")
    await page.keyboard.type(jenkins.text)
    await page.keyboard.press("Enter")

    await expectToBeHighlighted(page.locator(jenkins.tag))
    await expect(page.locator(jenkins.input)).toBeHidden()

    await expect(page.locator(input)).toBeFocused()
  })

  test("add tags from paste event", async ({ page }) => {
    await page.check(testid("addOnPaste"))
    await page.focus(input)

    await page.$eval(input, paste, "Github, Jenkins")

    const github = item("Github")
    const jenkins = item("Jenkins")
    await expect(page.locator(github.tag)).toBeVisible()
    await expect(page.locator(jenkins.tag)).toBeVisible()
  })

  test("clears highlighted tag on escape press", async ({ page }) => {
    const svelte = item("Svelte")
    await page.type(input, "Svelte")

    await page.keyboard.press("Enter")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("Escape")

    const tag = page.locator(svelte.tag)
    expect(await tag.getAttribute("data-selected")).toBeFalsy()
  })
})
