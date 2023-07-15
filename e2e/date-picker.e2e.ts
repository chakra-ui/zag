import { getLocalTimeZone, parseDate, today, startOfMonth, endOfMonth } from "@internationalized/date"
import { expect, type Page, test } from "@playwright/test"
import { a11y, part } from "./__utils"

const createScreen = (page: Page) => ({
  trigger: page.locator(part("trigger")),
  input: page.locator(part("input")),
  content: page.locator(part("content")),
  monthSelect: page.locator(part("month-select")),
  yearSelect: page.locator(part("year-select")),
  prevTrigger: page.locator(part("prev-trigger")),
  nextTrigger: page.locator(part("next-trigger")),
  grid: page.locator(part("grid")),
  todayCell: page.locator(`${part("cell-trigger")}[data-today]`),
  getFirstDayCell() {
    const start = startOfMonth(today(getLocalTimeZone()))
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value="${start.toString()}"]`)
  },
  getLastDayCell() {
    const end = endOfMonth(today(getLocalTimeZone()))
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value="${end.toString()}"]`)
  },
  getNextDayCell(opts: { current?: string; step?: number } = {}) {
    const { current, step = 1 } = opts
    const now = current ? parseDate(current) : today(getLocalTimeZone())
    const next = now.add({ days: step })
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value="${next.toString()}"]`)
  },
  getPrevDayCell(opts: { current?: string; step?: number } = {}) {
    const { current, step = 1 } = opts
    const now = current ? parseDate(current) : today(getLocalTimeZone())
    const prev = now.add({ days: -1 * step })
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value="${prev.toString()}"]`)
  },
  getDayCell(value: string) {
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value="${value}"]`)
  },
  getMonthCell(value: string) {
    return page.locator(`${part("cell-trigger")}[data-type=month][data-value="${value}"]`)
  },
  getYearCell(value: string) {
    return page.locator(`${part("cell-trigger")}[data-type=year][data-value="${value}"]`)
  },
})

test.describe("datepicker [single]", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/date-picker")
  })

  test("should have no accessibility violation", async ({ page }) => {
    const { trigger } = createScreen(page)
    await trigger.click()
    await a11y(page, "[data-part=content]")
  })

  test("opens the calendar on click trigger and focus on current date", async ({ page }) => {
    const { trigger, content, todayCell } = createScreen(page)
    await trigger.click()
    await expect(content).toBeVisible()
    expect(todayCell).toBeFocused()
  })

  test("closes the calendar on esc", async ({ page }) => {
    const { trigger, content } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("Escape")
    await expect(content).not.toBeVisible()
  })

  test("selecting a date with pointer", async ({ page }) => {
    const { trigger, content, todayCell, input } = createScreen(page)
    await trigger.click()
    await todayCell.click()
    await expect(content).not.toBeVisible()
    await expect(input).toBeFocused()
  })

  test("navigates to next day on ArrowRight key press", async ({ page }) => {
    const { trigger, getNextDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowRight")
    await expect(getNextDayCell()).toBeFocused()
  })

  test("navigates to previous day on ArrowLeft key press", async ({ page }) => {
    const { trigger, getPrevDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowLeft")
    await expect(getPrevDayCell()).toBeFocused()
  })

  test("navigates to previous week on ArrowUp key press", async ({ page }) => {
    const { trigger, getPrevDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowUp")
    await expect(getPrevDayCell({ step: 7 })).toBeFocused()
  })

  test("navigates to next week on ArrowDown key press", async ({ page }) => {
    const { trigger, getNextDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("ArrowDown")
    await expect(getNextDayCell({ step: 7 })).toBeFocused()
  })

  test("navigates to first day of the month on Home key press", async ({ page }) => {
    const { trigger, getFirstDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("Home")
    await expect(getFirstDayCell()).toBeFocused()
  })

  test("navigates to last day of the month on End key press", async ({ page }) => {
    const { trigger, getLastDayCell } = createScreen(page)
    await trigger.click()
    await page.keyboard.press("End")
    await expect(getLastDayCell()).toBeFocused()
  })

  // test("should close datepicker popup upon click on a date", async () => {})
  // test("updates the calendar when a year selected from the dropdown", async ({ page }) => {})
  // test("updates the calendar when a month selected from the dropdown", async ({ page }) => {})

  // test("navigates to next week on ArrowDown key press", async ({ page }) => {})
  // test("navigates to previous week on ArrowUp key press", async ({ page }) => {})

  // test("navigates to next month on PageDown key press", async ({ page }) => {})
  // test("navigates to previous month on PageUp key press", async ({ page }) => {})

  // test("navigates to next year on Shift+PageDown key press", async ({ page }) => {})
  // test("navigates to previous year on Shift+PageUp key press", async ({ page }) => {})

  // test("renders previous month when the left arrow is clicked", async ({ page }) => {})
  // test("renders next month when the right arrow is clicked", async ({ page }) => {})
})
