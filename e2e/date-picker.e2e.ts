import { test } from "@playwright/test"
import { DatePickerModel } from "./models/datepicker.model"

let I: DatePickerModel

test.describe("datepicker [single]", () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
  // const day = currentDate.getDate().toString().padStart(2, "0")

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
    await I.seeContent()
    await I.seeTodayCellIsFocused()
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
    await I.seeContent()
    await I.seeTodayCellIsFocused()
    await I.pressKey("ArrowRight")
    await I.seeNextDayCellIsFocused()
  })

  test("navigates to previous day on ArrowLeft key press", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
    await I.pressKey("ArrowLeft")
    await I.seePrevDayCellIsFocused()
  })

  test("navigates to previous week on ArrowUp key press", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
    await I.pressKey("ArrowUp")
    await I.seePrevDayCellIsFocused({ step: 7 })
  })

  test("navigates to next week on ArrowDown key press", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
    await I.pressKey("ArrowDown")
    await I.seeNextDayCellIsFocused({ step: 7 })
  })

  test("navigates to first day of the month on Home key press", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
    await I.pressKey("Home")
    await I.seeFirstDayCellIsFocused()
  })

  test("navigates to last day of the month on End key press", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeTodayCellIsFocused()
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
    await I.type(`02/28/${year}`)
    await I.pressKey("Enter")
    await I.seeInputHasValue(`02/28/${year}`)
  })

  test("keyboard selection + re-selection", async () => {
    await I.type(`02/28/${year}`)
    await I.pressKey("Enter")
    await I.seeInputHasValue(`02/28/${year}`)

    await I.pressKey("Backspace", 5) // becomes 02/28
    await I.pressKey("Enter")
    await I.seeInputHasValue(`02/28/${year}`)
  })

  test("clearing input field should clear the date picker value", async () => {
    await I.type(`${month}/05/${year}`)
    await I.pressKey("Enter")
    await I.seeInputHasValue(`${month}/05/${year}`)

    await I.clearInput()
    await I.seeInputHasValue("")
    await I.seeSelectedValue("")

    await I.clickTrigger()
    await I.clickDayCell("5")
    await I.seeInputHasValue(`${month}/05/${year}`)
  })

  test("entering invalid date should not crash the datepicker", async () => {
    await I.type("93495849")
    await I.pressKey("Enter")
    await I.seeInputHasValue("01/01/9999")
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

test.describe("datepicker [min-max]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker-min-max")
  })

  test("constrains date to max value on blur when out-of-range date entered", async () => {
    // Min: 2025-07-01, Max: 2025-09-30
    // Enter a date after max (2025-10-15)
    await I.type("10/15/2025")
    await I.seeInputHasValue("10/15/2025") // Verify typed value is there
    await I.clickOutsideToBlur() // Use more reliable blur method
    await I.seeInputIsNotFocused() // Verify blur completed
    await I.seeInputHasValue("09/30/2025") // Should be constrained to max
    await I.seeSelectedValue("09/30/2025")
  })

  test("constrains date to min value on blur when out-of-range date entered", async () => {
    // Min: 2025-07-01, Max: 2025-09-30
    // Enter a date before min (2025-05-15)
    await I.type("05/15/2025")
    await I.seeInputHasValue("05/15/2025") // Verify typed value is there
    await I.clickOutsideToBlur() // Use more reliable blur method
    await I.seeInputIsNotFocused() // Verify blur completed
    await I.seeInputHasValue("07/01/2025") // Should be constrained to min
    await I.seeSelectedValue("07/01/2025")
  })

  test("constrains date to max value on Enter when out-of-range date entered", async () => {
    // Min: 2025-07-01, Max: 2025-09-30
    // Enter a date after max (2025-11-20)
    await I.type("11/20/2025")
    await I.seeInputHasValue("11/20/2025") // Verify typed value is there
    await I.pressKey("Enter")
    await I.seeInputHasValue("09/30/2025") // Should be constrained to max
    await I.seeSelectedValue("09/30/2025")
  })

  test("constrains date to min value on Enter when out-of-range date entered", async () => {
    // Min: 2025-07-01, Max: 2025-09-30
    // Enter a date before min (2025-04-10)
    await I.type("04/10/2025")
    await I.seeInputHasValue("04/10/2025") // Verify typed value is there
    await I.pressKey("Enter")
    await I.seeInputHasValue("07/01/2025") // Should be constrained to min
    await I.seeSelectedValue("07/01/2025")
  })

  test("allows valid dates within range", async () => {
    // Min: 2025-07-01, Max: 2025-09-30
    // Enter a valid date within range (2025-08-15)
    await I.type("08/15/2025")
    await I.pressKey("Enter")
    await I.seeInputHasValue("08/15/2025") // Should remain unchanged
    await I.seeSelectedValue("08/15/2025")
  })
})

test.describe("datepicker [range]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker-range")
  })

  test("should not crash when typing end date first", async () => {
    // Regression test for issue #2809
    // Focus the end date input (index 1) first and type a valid date
    await I.focusInput(1)
    await I.type("06/15/2024", 1)
    await I.clickOutsideToBlur()

    // Should not crash and the value should be set
    await I.seeInputHasValue("06/15/2024", 1)
  })

  test("should allow selecting dates after typing end date first", async () => {
    // Type end date first
    await I.focusInput(1)
    await I.type("06/20/2024", 1)
    await I.clickOutsideToBlur()
    await I.seeInputHasValue("06/20/2024", 1)

    // Open calendar and select a start date - should not crash
    await I.clickTrigger()
    await I.seeContent()
    await I.clickDayCell(10)
    await I.seeInputHasValue("06/10/2024", 0)
  })

  test("should not crash when blurring end date input twice after typing end date first", async () => {
    // Regression test for issue #2840
    // 1. Type a valid end date first (e.g. 06/15/2024)
    await I.focusInput(1)
    await I.type("06/15/2024", 1)
    await I.clickOutsideToBlur()

    // 2. Focus again on the period end date input
    await I.focusInput(1)

    // 3. Blur the field again - should not crash
    await I.clickOutsideToBlur()

    // Should not crash and the value should still be set
    await I.seeInputHasValue("06/15/2024", 1)
  })

  test("should not crash when changing end date after typing end date first", async () => {
    // Regression test for issue #2864
    // 1. Type a valid end date first (e.g. 06/15/2024)
    await I.type("06/15/2024", 1)
    await I.clickOutsideToBlur()

    // 2. Change the end date by typing a new value (e.g., 06/15/2025)
    await I.selectInput(1)
    await I.type("06/15/2025", 1)
    await I.clickOutsideToBlur()

    // Should not crash and the new value should be set
    await I.seeInputHasValue("06/15/2025", 1)
  })
})
