import { expect, Page, test } from "@playwright/test"
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
  dayCell(value: string) {
    return page.locator(`${part("cell-trigger")}[data-type=day][data-value=${value}]`)
  },
  monthCell(value: string) {
    return page.locator(`${part("cell-trigger")}[data-type=month][data-value=${value}]`)
  },
  yearCell(value: string) {
    return page.locator(`${part("year-cell-trigger")}[data-type=year][data-value=${value}]`)
  },
})

test.describe("datepicker [single]", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/date-picker")
  })

  test("should have no accessibility violation", async ({ page }) => {
    const screen = createScreen(page)
    await screen.trigger.click()
    await a11y(page, "[data-part=content]")
  })

  test("opens the calendar on click trigger and focus on current date", async ({ page }) => {
    const screen = createScreen(page)
    await screen.trigger.click()
    await expect(screen.content).toBeVisible()
    expect(screen.todayCell).toBeFocused()
  })

  test("closes the calendar on esc", async ({ page }) => {
    const screen = createScreen(page)
    await screen.trigger.click()
    await page.keyboard.press("Escape")
    await expect(screen.content).not.toBeVisible()
  })

  test("selecting a date with pointer", async ({ page }) => {
    const screen = createScreen(page)
    await screen.trigger.click()
    await screen.todayCell.click()
    await expect(screen.content).not.toBeVisible()
    await expect(screen.input).toBeFocused()
  })

  // test("should close datepicker popup upon click on a date", async () => {})
  // test("updates the calendar when a year selected from the dropdown", async ({ page }) => {})
  // test("updates the calendar when a month selected from the dropdown", async ({ page }) => {})

  // test("navigates to next day on ArrowRight key press", async ({ page }) => {})
  // test("navigates to previous day on ArrowLeft key press", async ({ page }) => {})

  // test("navigates to next week on ArrowDown key press", async ({ page }) => {})
  // test("navigates to previous week on ArrowUp key press", async ({ page }) => {})

  // test("navigates to next month on PageDown key press", async ({ page }) => {})
  // test("navigates to previous month on PageUp key press", async ({ page }) => {})

  // test("navigates to next year on Shift+PageDown key press", async ({ page }) => {})
  // test("navigates to previous year on Shift+PageUp key press", async ({ page }) => {})

  // test("renders previous month when the left arrow is clicked", async ({ page }) => {})
  // test("renders next month when the right arrow is clicked", async ({ page }) => {})
})
