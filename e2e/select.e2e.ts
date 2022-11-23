import { expect, Locator, test } from "@playwright/test"
import { a11y, controls, isInViewport, part, pointer, repeat } from "./__utils"

const label = part("label")
const trigger = part("trigger")
const menu = part("menu")
const options = {
  first: "[role=option]:first-of-type",
  last: "[role=option]:last-of-type",
  get: (id: string) => `[role=option][data-value="${id}"]`,
}

const expectToBeSelected = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-selected", "")
}

const expectToBeHighlighted = async (el: Locator) => {
  await expect(el).toHaveAttribute("data-focus", "")
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
    const albania = page.locator(options.get("AL"))
    await pointer.move(albania)
    await pointer.up(albania)
    await expectToBeSelected(albania)
    await expect(page.locator(trigger)).toContainText("Albania")
  })

  test("should highlight on hover", async ({ page }) => {
    await page.click(trigger)

    const albania = page.locator(options.get("AL"))
    await pointer.move(albania)
    await expectToBeHighlighted(albania)

    const angola = page.locator(options.get("AO"))
    await pointer.move(angola)
    await expectToBeHighlighted(angola)
  })
})

test.describe("select/ open / keyboard", () => {
  test("should navigate on arrow down", async ({ page }) => {
    await page.click(trigger)
    await repeat(() => page.keyboard.press("ArrowDown"), 3)
    const afganistan = page.locator(options.get("AF"))
    await expectToBeHighlighted(afganistan)
    await expectToBeInViewport(page.locator(menu), afganistan)
  })

  test("should navigate on arrow up", async ({ page }) => {
    await page.click(trigger)
    await repeat(() => page.keyboard.press("ArrowUp"), 3)
    const southAfrica = page.locator(options.get("ZA"))
    await expectToBeHighlighted(southAfrica)
    await expectToBeInViewport(page.locator(menu), southAfrica)
  })

  test("should navigate on home/end", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("End")
    const zimbabwe = page.locator(options.get("ZW"))
    await expectToBeHighlighted(zimbabwe)
    await expectToBeInViewport(page.locator(menu), zimbabwe)

    await page.keyboard.press("Home")
    const andora = page.locator(options.get("AD"))
    await expectToBeHighlighted(andora)
    await expectToBeInViewport(page.locator(menu), andora)
  })

  test("should navigate on typeahead", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.type("Cy")
    const cyprus = page.locator(options.get("CY"))
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
    const andorra = page.locator(options.get("AD"))
    await expectToBeSelected(andorra)
    await expect(page.locator(trigger)).toContainText("Andorra")
  })

  test("should select on space", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press(" ")
    const andorra = page.locator(options.get("AD"))
    await expectToBeSelected(andorra)
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
    await repeat(() => page.keyboard.press("ArrowDown"), 3)
    await page.keyboard.press("Tab")
    await expect(page.locator(menu)).not.toBeVisible()
    await expect(page.locator(trigger)).toContainText("Select option")
  })

  test("should close on press tab - with select", async ({ page }) => {
    await controls(page).bool("selectOnTab", true)
    await page.click(trigger)
    await repeat(() => page.keyboard.press("ArrowDown"), 3)

    const afganistan = page.locator(options.get("AF"))
    await page.keyboard.press("Tab")
    await expect(page.locator(menu)).not.toBeVisible()
    await expectToBeSelected(afganistan)
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
    await expectToBeHighlighted(page.locator(options.first))
  })

  test("should open with up arrow keys  + highlight last option", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowUp")
    await expect(page.locator(menu)).toBeVisible()
    await expectToBeHighlighted(page.locator(options.last))
  })
})

test.describe("select / focused / select option", () => {
  test("should select last option on arrow left", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowLeft")
    await expectToBeSelected(page.locator(options.get("ZW")))
  })

  test("should select last option on arrow right", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("ArrowRight")
    await expectToBeSelected(page.locator(options.get("AD")))
  })

  test("should select with typeahead", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.type("Nigeri")
    await expectToBeSelected(page.locator(options.get("NG")))
  })

  test("should cycle selected value with typeahead", async ({ page }) => {
    await page.focus(trigger)

    await page.keyboard.type("P") // select Panama
    await expectToBeSelected(page.locator(options.get("PA")))

    await page.keyboard.type("P") // select Panama
    await expectToBeSelected(page.locator(options.get("PE")))

    await page.keyboard.type("P") // select papua new guinea
    await expectToBeSelected(page.locator(options.get("PG")))

    await page.waitForTimeout(350) // default timeout for typeahead to reset
    await page.keyboard.type("K") // select papua new guinea
    await expectToBeSelected(page.locator(options.get("KE")))
  })
})
