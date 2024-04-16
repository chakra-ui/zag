import { expect, type Page, test } from "@playwright/test"
import { a11y, part } from "./_utils"

const createScreen = (page: Page) => ({
  trigger: page.locator(part("trigger")),
  input: page.locator(part("input")),
  content: page.locator(part("content")),
  clearTrigger: page.locator(part("clear-trigger")),
  getHourCell: (hasText: string) => page.locator(part("hour-cell"), { hasText }),
  getMinuteCell: (hasText: string) => page.locator(part("minute-cell"), { hasText }),
  getPeriodCell: (hasText: "AM" | "PM") => page.locator(part("period-cell"), { hasText }),
})

test.describe("timepicker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/time-picker")
  })

  test("should have no accessibility violation", async ({ page }) => {
    const { trigger } = createScreen(page)
    await trigger.click()
    await a11y(page, "[data-part=content]")
  })

  test("opens the time picker on click trigger and focus on first hour", async ({ page }) => {
    const { trigger, content, getHourCell } = createScreen(page)
    await trigger.click()
    await expect(content).toBeVisible()
    await expect(getHourCell("00")).toBeFocused()
  })

  test("closes the time picker on esc", async ({ page }) => {
    const { trigger, content } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("Escape")
    await expect(content).not.toBeVisible()
  })

  test("selecting a time with pointer", async ({ page }) => {
    const { trigger, getHourCell, getMinuteCell, getPeriodCell, input } = createScreen(page)
    await trigger.click()
    await getHourCell("05").click()
    await expect(input).toHaveValue("05:00 AM")
    await getHourCell("08").click()
    await getMinuteCell("30").click()
    await getPeriodCell("PM").click()
    await expect(input).toHaveValue("08:30 PM")
  })

  test("properly format the input value on Enter key press", async ({ page }) => {
    const { input } = createScreen(page)
    await input.fill("5:30 pm")
    await page.keyboard.press("Enter")
    await expect(input).toHaveValue("05:30 PM")
  })

  test("clear the time on clear button click", async ({ page }) => {
    const { trigger, input, clearTrigger, getHourCell } = createScreen(page)
    await trigger.click()
    await getHourCell("08").click()
    await clearTrigger.click()
    await expect(input).toHaveValue("")
  })

  test("navigates to next hour on ArrowDown key press", async ({ page }) => {
    const { trigger, getHourCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowDown")
    await expect(getHourCell("01")).toBeFocused()
  })

  test("navigates to previous hour on ArrowUp key press", async ({ page }) => {
    const { trigger, getHourCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowUp")
    await expect(getHourCell("02")).toBeFocused()
  })

  test("navigates to first minute on ArrowRight key press", async ({ page }) => {
    const { trigger, getMinuteCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight")
    await expect(getMinuteCell("00")).toBeFocused()
  })

  test("navigates to next minute on ArrowDown key press", async ({ page }) => {
    const { trigger, getMinuteCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await expect(getMinuteCell("01")).toBeFocused()
  })

  test("navigates to previous minute on ArrowUp key press", async ({ page }) => {
    const { trigger, getMinuteCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowUp")
    await expect(getMinuteCell("02")).toBeFocused()
  })

  test("navigates to first period on ArrowRight key press", async ({ page }) => {
    const { trigger, getPeriodCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowRight")
    await expect(getPeriodCell("AM")).toBeFocused()
  })

  test("navigates to next period on ArrowDown key press", async ({ page }) => {
    const { trigger, getPeriodCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowDown")
    await expect(getPeriodCell("PM")).toBeFocused()
  })

  test("navigates to previous period on ArrowUp key press", async ({ page }) => {
    const { trigger, getPeriodCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowRight", { delay: 10 })
    await page.keyboard.press("ArrowDown", { delay: 10 })
    await page.keyboard.press("ArrowUp")
    await expect(getPeriodCell("AM")).toBeFocused()
  })
})
