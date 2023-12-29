import { expect, type Locator, test } from "@playwright/test"
import { a11y, controls, isInViewport, repeat, testid } from "./_utils"

const input = testid("input")
const trigger = testid("trigger")
const content = testid("combobox-content")
const clear_value_button = testid("clear-value-button")

const options = "[data-part=item]:not([data-disabled])"
const highlighted_option = "[data-part=item][data-highlighted]"

const expectToBeHighlighted = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-highlighted", "")
}

const expectToBeChecked = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-state", "checked")
}

const expectNotToBeChecked = async (el: Locator) => {
  await expect(el).not.toHaveAttribute("data-state", "checked")
}

const expectToBeInViewport = async (viewport: Locator, option: Locator) => {
  expect(await isInViewport(viewport, option)).toBe(true)
}

test.describe("combobox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/combobox")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("[pointer] should open combobox menu when arrow is clicked", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(input)).toBeFocused()
  })

  test("[keyboard] Escape should close content", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.locator(content)).not.toBeVisible()
  })

  test("[typeahead / autohighlight / selection] should open combobox menu when typing", async ({ page }) => {
    await page.locator(input).pressSequentially("an")
    await expect(page.locator(content)).toBeVisible()

    const option = page.locator(options).first()
    await expectToBeHighlighted(option)

    await page.keyboard.press("Enter")

    await expect(page.locator(input)).toHaveValue("Canada")
    await expect(page.locator(content)).toBeHidden()
  })

  test("[pointer / selection]", async ({ page }) => {
    await page.click(trigger)

    const option_els = page.locator(options)
    await option_els.nth(0).hover()
    await expectToBeHighlighted(option_els.nth(0))

    await option_els.nth(1).hover()
    await option_els.nth(3).hover()
    const option = option_els.nth(3)
    option.click()

    const textValue = await option.textContent()
    await expect(page.locator(input)).toHaveValue(textValue!)
    await expect(page.locator(content)).toBeHidden()
  })

  test("[keyboard / loop] on arrow down, open and highlight first enabled option", async ({ page }) => {
    await page.focus(input)
    await page.keyboard.press("ArrowDown")
    const option = page.locator(options).first()
    await expect(page.locator(content)).toBeVisible()
    await expectToBeHighlighted(option)
  })

  test("[keyboard / no-loop] on arrow down, open and highlight first enabled option", async ({ page }) => {
    await controls(page).bool("loop", false)

    await page.focus(input)
    await page.keyboard.press("ArrowDown")
    const option = page.locator(options).first()
    await expect(page.locator(content)).toBeVisible()
    await expectToBeHighlighted(option)
  })

  test("[keyboard / loop] on arrow up, open and highlight last enabled option", async ({ page }) => {
    await page.focus(input)
    await page.keyboard.press("ArrowUp")
    const option = page.locator(options).last()
    await expect(page.locator(content)).toBeVisible()
    await expectToBeHighlighted(option)
  })

  test("[keyboard / no-loop] on arrow up, open and highlight last enabled option", async ({ page }) => {
    await controls(page).bool("loop", false)

    await page.focus(input)
    await page.keyboard.press("ArrowUp")
    const option = page.locator(options).last()
    await expect(page.locator(content)).toBeVisible()
    await expectToBeHighlighted(option)
  })

  test("[keyboard / opened] on home and end, when open, focus first and last option", async ({ page }) => {
    const option_els = page.locator(options)

    await page.click(trigger)

    // navigate a bit with the keyboard
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")

    await page.keyboard.press("Home")
    await expectToBeHighlighted(option_els.first())

    await page.keyboard.press("End")
    await expectToBeHighlighted(option_els.last())
  })

  test("[keyboard / closed] on home and end, caret moves to start and end", async ({ page }) => {
    await page.click(trigger)
    await page.locator(input).pressSequentially("an")

    // close
    await page.keyboard.press("Escape")

    await page.keyboard.press("Home")
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).selectionStart)).toBe(0)

    await page.keyboard.press("End")
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).selectionStart)).toBe(2)
  })

  test("[keyboard / arrowdown / loop]", async ({ page }) => {
    await page.locator(input).pressSequentially("mal")

    const option_els = page.locator(options)

    await repeat(4, () => page.keyboard.press("ArrowDown"))

    await expectToBeHighlighted(option_els.last())
    await page.keyboard.press("ArrowDown")
    await expectToBeHighlighted(option_els.first())
  })

  test("[keyboard / arrowdown / no-loop]", async ({ page }) => {
    await controls(page).bool("loop", false)

    await page.locator(input).pressSequentially("mal")

    const option_els = page.locator(options)

    await repeat(4, () => page.keyboard.press("ArrowDown"))

    await expectToBeHighlighted(option_els.last())
    await page.keyboard.press("ArrowDown")
    await expectToBeHighlighted(option_els.last())
  })

  test("[keyboard / arrowup / loop]", async ({ page }) => {
    await page.locator(input).pressSequentially("mal")
    const option_els = page.locator(options)
    await page.keyboard.press("ArrowUp")
    await expectToBeHighlighted(option_els.last())
  })

  test("[keyboard / arrowup / no-loop]", async ({ page }) => {
    await controls(page).bool("loop", false)

    await page.locator(input).pressSequentially("mal")
    const option_els = page.locator(options)
    await page.keyboard.press("ArrowUp")
    await expectToBeHighlighted(option_els.first())
  })

  test("[pointer / open-on-click]", async ({ page }) => {
    await controls(page).bool("openOnClick")
    await page.click(input, { force: true })
    await expect(page.locator(content)).toBeVisible()
  })

  test("selects value on click", async ({ page }) => {
    await page.click(trigger)
    const option_els = page.locator(options)
    await option_els.first().click()
    await page.click(trigger)
    await expectToBeChecked(option_els.first())
  })

  test("can clear value", async ({ page }) => {
    await page.click(trigger)
    const option_els = page.locator(options)
    await option_els.first().click()
    await page.click(trigger)
    await page.locator(clear_value_button).click()

    await expect(page.locator(input)).toHaveValue("")
    await expectNotToBeChecked(option_els.first())
  })

  test("should scroll selected option into view", async ({ page }) => {
    await page.click(trigger)
    const malta = page.locator(options).locator("text=Malta").first()
    await malta.click()
    await page.click(trigger)

    await expectToBeHighlighted(malta)
    await expectToBeInViewport(page.locator(content), malta)
  })

  test.describe("[auto-complete]", () => {
    test.beforeEach(async ({ page }) => {
      await controls(page).select("inputBehavior", "autocomplete")
    })

    test("[keyboard] should autocomplete", async ({ page }) => {
      await page.locator(input).pressSequentially("mal")

      // no option should be selected
      const count = await page.locator(highlighted_option).count()
      expect(count).toBe(0)

      // autocomplete
      const option_els = page.locator(options)
      await page.keyboard.press("ArrowDown")

      await expectToBeHighlighted(option_els.first())
      const textValue = await option_els.first().textContent()
      await expect(page.locator(input)).toHaveValue(textValue!)

      await page.keyboard.press("Enter")

      await expect(page.locator(input)).toHaveValue(textValue!)
      await expect(page.locator(content)).toBeHidden()
      await expect(page.locator(input)).toBeFocused()
    })

    test("[keyboard / loop] should loop through the options and previous input value", async ({ page }) => {
      await page.locator(input).pressSequentially("mal")

      //press arrow down 5 times
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown", { delay: 10 }) // reached the end

      // at the end of the list, press arrow down to return to previous input value
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(input)).toHaveValue("mal")

      // no option should be selected
      const count = await page.locator(highlighted_option).count()
      expect(count).toBe(0)
    })

    test("[pointer] hovering an option should not update input value", async ({ page }) => {
      await page.click(trigger)
      await page.locator(input).pressSequentially("mal")

      const option_els = page.locator(options)
      await option_els.nth(4).hover()
      await expect(page.locator(input)).toHaveValue("mal")
    })
  })
})
