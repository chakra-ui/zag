import { expect, test } from "@playwright/test"
import { DatePickerModel } from "./models/datepicker.model"

let I: DatePickerModel

test.describe("date-picker / year view", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/year")
    await I.clickTrigger()
    await I.seeContent()
  })

  test("should render exactly the decade in view", async () => {
    const years = await I.getVisibleYears()
    expect(years).toHaveLength(10)
    expect(years.at(-1)! - years.at(0)!).toBe(9)
  })

  test("should not disable any year without min or max", async () => {
    await I.seeNoDisabledYearCells()
  })

  test("[keyboard] should move focus to the ends of the decade", async () => {
    const years = await I.getVisibleYears()

    await I.focusFirstYearCell()
    await I.pressKey("End")
    await I.seeYearCellIsFocused(years.at(-1)!)

    await I.pressKey("Home")
    await I.seeYearCellIsFocused(years.at(0)!)
  })
})

test.describe("date-picker / year range", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/year-range")
    await I.clickTrigger()
    await I.seeContent()
  })

  test("[pointer] should show the hovered range ahead of the anchor", async () => {
    await I.clickYearCell(2022)
    await I.hoverYearCell(2027)

    await I.seeYearsInHoverRange([2022, 2023, 2024, 2025, 2026, 2027])
  })

  test("[pointer] should show the hovered range behind the anchor", async () => {
    await I.clickYearCell(2022)
    await I.hoverYearCell(2021)

    await I.seeYearsInHoverRange([2021, 2022])
  })

  test("[pointer] should carry the range across decades", async () => {
    await I.clickYearCell(2022)
    await I.clickNextDecade()

    await I.hoverYearCell(2033)
    await I.seeYearsInHoverRange([2030, 2031, 2032, 2033])

    await I.clickYearCell(2033)
    await I.seeSelectedValue("20222033")
  })
})

test.describe("date-picker / year inline", () => {
  test.beforeEach(async ({ page }) => {
    I = new DatePickerModel(page)
    await I.goto("/date-picker/year-inline")
  })

  test("should only disable years outside min and max", async () => {
    await I.seeYearCellIsDisabled(2014)
    await I.seeYearCellIsDisabled(2036)

    await I.dontSeeYearCellIsDisabled(2015)
    await I.dontSeeYearCellIsDisabled(2035)
  })

  test("should keep years outside the decade in view selectable", async () => {
    await I.seeYearCellIsOutsideRange(2032)
    await I.dontSeeYearCellIsDisabled(2032)
  })

  test("should move the decade in view when one of them is clicked", async ({ page }) => {
    await I.clickYearCell(2032)

    await expect(page.locator("[data-testid=decade]")).toHaveText("2030-2039")
  })
})
