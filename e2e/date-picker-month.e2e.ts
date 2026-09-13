import { expect, test } from "@playwright/test"
import { DatePickerModel } from "./models/datepicker.model"

let I: DatePickerModel

test.describe("date-picker / month view", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/month")
    await I.clickTrigger()
    await I.seeContent()
  })

  test("should render every month of the year in view", async () => {
    expect(await I.getVisibleMonths()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  test("should not disable any month without min or max", async () => {
    await I.seeNoDisabledMonthCells()
  })

  test("[keyboard] should move focus to the ends of the year", async () => {
    await I.focusFirstMonthCell()

    await I.pressKey("End")
    await I.seeMonthCellIsFocused(12)

    await I.pressKey("Home")
    await I.seeMonthCellIsFocused(1)
  })
})

test.describe("date-picker / month range", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/month-range")
    await I.clickTrigger()
    await I.seeContent()
  })

  test("[pointer] should show the hovered range ahead of the anchor", async () => {
    await I.clickMonthCell(3)
    await I.hoverMonthCell(7)

    await I.seeMonthsInHoverRange([3, 4, 5, 6, 7])
  })

  test("[pointer] should show the hovered range behind the anchor", async () => {
    await I.clickMonthCell(7)
    await I.hoverMonthCell(5)

    await I.seeMonthsInHoverRange([5, 6, 7])
  })

  test("[pointer] should carry the range across years", async () => {
    await I.clickMonthCell(10)
    await I.clickNextYear()

    await I.hoverMonthCell(3)
    await I.seeMonthsInHoverRange([1, 2, 3])
  })
})

test.describe("date-picker / month inline", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/month-inline")
  })

  test("should only disable months outside min and max", async () => {
    // constrained to march through september
    for (const month of [1, 2, 10, 11, 12]) {
      await I.seeMonthCellIsDisabled(month)
    }
    for (const month of [3, 6, 9]) {
      await I.dontSeeMonthCellIsDisabled(month)
    }
  })

  test("should select a month within the range", async ({ page }) => {
    await I.clickMonthCell(6)

    await expect(page.locator("[data-testid=selected]")).not.toHaveText("none")
  })
})
