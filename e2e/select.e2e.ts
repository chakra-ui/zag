import { expect, type Locator, test } from "@playwright/test"
import { a11y, controls, isInViewport, part, pointer, repeat } from "./__utils"

const label = part("label")
const trigger = part("trigger")
const menu = part("content")

const options = "[data-part=item]:not([data-disabled])"
const getOption = (id: string) => `[data-part=item][data-value="${id}"]`

const expectToBeHighlighted = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-highlighted", "")
}

const expectToBeChecked = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-state", "checked")
}

const expectToBeInViewport = async (viewport: Locator, option: Locator) => {
  expect(await isInViewport(viewport, option)).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.goto("/select")
})

test.describe("select / accessibility", () => {
  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page, ".select")
  })

  test("clicking the label should focus control", async ({ page }) => {
    await page.click(label)
    await expect(page.locator(trigger)).toBeFocused()
  })

  test("trigger sets aria-labbeledby to label id", async ({ page }) => {
    const labelId = await page.locator(label).getAttribute("id")
    expect(labelId).not.toBeNull()
    await expect(page.locator(trigger)).toHaveAttribute("aria-labelledby", labelId as string)
  })
})

test.describe("select / pointer", () => {
  test("should toggle select", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(menu)).toBeVisible()
    await page.click(trigger)
    await expect(page.locator(menu)).not.toBeVisible()
  })

  test("should open with pointer", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should open with pointer down", async ({ page }) => {
    await pointer.down(page.locator(trigger))
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should open and select with pointer cycle", async ({ page }) => {
    await pointer.down(page.locator(trigger))
    const albania = page.locator(getOption("AL"))
    await pointer.move(albania)
    await pointer.up(albania)
    await expectToBeChecked(albania)
    await expect(page.locator(trigger)).toContainText("Albania")
  })

  test("should highlight on hover", async ({ page }) => {
    await page.click(trigger)

    const albania = page.locator(getOption("AL"))
    await pointer.move(albania)
    await expectToBeHighlighted(albania)

    const angola = page.locator(getOption("AO"))
    await pointer.move(angola)
    await expectToBeHighlighted(angola)
  })
})

test.describe("select/ open / keyboard", () => {
  test("should navigate on arrow down", async ({ page }) => {
    await page.click(trigger)
    await repeat(3, () => page.keyboard.press("ArrowDown"))
    const afganistan = page.locator(getOption("AF"))
    await expectToBeHighlighted(afganistan)
    await expectToBeInViewport(page.locator(menu), afganistan)
  })

  test("should navigate on arrow up", async ({ page }) => {
    await page.click(trigger)
    await repeat(3, () => page.keyboard.press("ArrowUp"))
    const southAfrica = page.locator(getOption("ZA"))
    await expectToBeHighlighted(southAfrica)
    await expectToBeInViewport(page.locator(menu), southAfrica)
  })

  test("should navigate on home/end", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("End")
    const zimbabwe = page.locator(getOption("ZW"))
    await expectToBeHighlighted(zimbabwe)
    await expectToBeInViewport(page.locator(menu), zimbabwe)

    await page.keyboard.press("Home")
    const andora = page.locator(getOption("AD"))
    await expectToBeHighlighted(andora)
    await expectToBeInViewport(page.locator(menu), andora)
  })

  test("should navigate on typeahead", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.type("Cy")
    const cyprus = page.locator(getOption("CY"))
    await expectToBeHighlighted(cyprus)
    await expectToBeInViewport(page.locator(menu), cyprus)
  })
})

test.describe("select / keyboard / close", () => {
  test("should close on escape", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("Escape")
    await expect(page.locator(menu)).not.toBeVisible()
  })
})

test.describe("select / keyboard / select", () => {
  test("should select on enter", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    const andorra = page.locator(getOption("AD"))
    await expectToBeChecked(andorra)
    await expect(page.locator(trigger)).toContainText("Andorra")
  })

  test("should select on space", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press(" ")
    const andorra = page.locator(getOption("AD"))
    await expectToBeChecked(andorra)
    await expect(page.locator(trigger)).toContainText("Andorra")
  })

  test("should close on select", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(page.locator(menu)).not.toBeVisible()
  })

  test("should not close on select / closeOnSelect = false", async ({ page }) => {
    await controls(page).bool("closeOnSelect", false)
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(page.locator(menu)).toBeVisible()
  })
})

test.describe("select / open / blur", () => {
  test("should close on outside click", async ({ page }) => {
    await page.click(trigger)
    await page.click("body")
    await expect(page.locator(menu)).not.toBeVisible()
  })

  test("should close on press tab - no select", async ({ page }) => {
    await page.click(trigger)
    await repeat(3, () => page.keyboard.press("ArrowDown"))
    await page.keyboard.press("Tab")
    await expect(page.locator(menu)).not.toBeVisible()
    await expect(page.locator(trigger)).toContainText("Select option")
  })

  test("should close on press tab - with select", async ({ page }) => {
    await controls(page).bool("selectOnBlur", true)
    await page.click(trigger)
    await repeat(3, () => page.keyboard.press("ArrowDown"))

    const afganistan = page.locator(getOption("AF"))
    await page.keyboard.press("Tab")
    await expect(page.locator(menu)).not.toBeVisible()
    await expectToBeChecked(afganistan)
  })
})

test.describe("select / focused / open", () => {
  test("should open the select with enter key", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should open the select with space key", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press(" ")
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should open with down arrow keys + highlight first option", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowDown")
    await expect(page.locator(menu)).toBeVisible()
    await expectToBeHighlighted(page.locator(options).first())
  })

  test("should open with up arrow keys  + highlight last option", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowUp")
    await expect(page.locator(menu)).toBeVisible()
    await expectToBeHighlighted(page.locator(options).last())
  })
})

test.describe("select / focused / select option", () => {
  test("should select last option on arrow left", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowLeft")
    await expectToBeChecked(page.locator(getOption("ZW")))
  })

  test("should select last option on arrow right", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowRight")
    await expectToBeChecked(page.locator(getOption("AD")))
  })

  test("should select with typeahead", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.type("Nigeri")
    await expectToBeChecked(page.locator(getOption("NG")))
  })

  test("should cycle selected value with typeahead", async ({ page }) => {
    await page.focus(trigger)

    await page.keyboard.type("P") // select Panama
    await expectToBeChecked(page.locator(getOption("PA")))

    await page.keyboard.type("P") // select Panama
    await expectToBeChecked(page.locator(getOption("PE")))

    await page.keyboard.type("P") // select papua new guinea
    await expectToBeChecked(page.locator(getOption("PG")))

    await page.waitForTimeout(350) // default timeout for typeahead to reset
    await page.keyboard.type("K") // select papua new guinea
    await expectToBeChecked(page.locator(getOption("KE")))
  })
})
