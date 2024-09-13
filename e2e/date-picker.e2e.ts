import { test } from "@playwright/test"
import { DatePickerModel } from "./models/datepicker.model"

let I: DatePickerModel

test.describe("datepicker [single]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.clickTrigger()
    await I.checkAccessibility()
  })

  test("opens the calendar on click trigger and focus on current date", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
  })

  test("closes the calendar on esc", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")
    await I.dontSeeContent()
  })

  test("selecting a date with pointer", async () => {
    await I.clickTrigger()
    await I.clickTodayCell()
    await I.dontSeeContent()
    await I.seeInputIsFocused()
  })

  test("navigates to next day on ArrowRight key press", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowRight")
    await I.seeNextDayCellIsFocused()
  })

  test("navigates to previous day on ArrowLeft key press", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowLeft")
    await I.seePrevDayCellIsFocused()
  })

  test("navigates to previous week on ArrowUp key press", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowUp")
    await I.seePrevDayCellIsFocused({ step: 7 })
  })

  test("navigates to next week on ArrowDown key press", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.seeNextDayCellIsFocused({ step: 7 })
  })

  test("navigates to first day of the month on Home key press", async () => {
    await I.clickTrigger()
    await I.pressKey("Home")
    await I.seeFirstDayCellIsFocused()
  })

  test("navigates to last day of the month on End key press", async () => {
    await I.clickTrigger()
    await I.pressKey("End")
    await I.seeLastDayCellIsFocused()
  })

  test("should close datepicker popup upon click on a date", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.clickDayCell(5)
    await I.dontSeeContent()
  })

  test("keyboard selection", async () => {
    await I.type("02/28/2024")
    await I.pressKey("Enter")
    await I.seeInputHasValue("02/28/2024")
  })

  test("keyboard selection + re-selection", async () => {
    await I.type("02/28/2024")
    await I.pressKey("Enter")
    await I.seeInputHasValue("02/28/2024")

    await I.pressKey("Backspace", 5) // becomes 02/28
    await I.pressKey("Enter")
    await I.seeInputHasValue("02/28/2024")
  })

  // test("click trigger + focus input + selection, set value in input", async () => {
  //   await I.clickTrigger()
  //   await I.seeContent()

  //   await I.focusInput()
  //   await I.seeContent()

  //   // 5th day
  //   await I.clickDayCell(5)
  //   const day = I.getDate({ day: 5 })
  //   await I.seeInputHasValue(day.formatted)
  // })

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
