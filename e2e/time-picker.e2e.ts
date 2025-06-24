import { test } from "@playwright/test"
import { TimePickerModel } from "./models/time-picker.model"

let I: TimePickerModel

test.describe.skip("timepicker", () => {
  test.beforeEach(async ({ page }) => {
    I = new TimePickerModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("on click, open picker and focus on current hour", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()
    await I.seeContent()
    await I.seeHourIsFocused(current.hour)
  })

  test("on esc, close time picker", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeInputIsFocused()
  })

  test("on hour click, select and use current min+period", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()
    await I.clickHourCell("05")
    await I.seeInputHasValue(`05:${current.minute} ${current.period}`)
  })

  test("on full selection, updates input value", async () => {
    await I.clickTrigger()
    await I.clickHourCell("08")
    await I.clickMinuteCell("30")
    await I.clickPeriodCell("PM")
    await I.seeInputHasValue("08:30 PM")
  })

  test("on input, parses the time", async () => {
    await I.type("5:30 pm")
    await I.pressKey("Enter")
    await I.seeInputHasValue("05:30 PM")
  })

  test("on clear click, empty the input", async () => {
    await I.clickTrigger()
    await I.clickHourCell("08")
    await I.clickClearTrigger()
    await I.seeInputHasValue("")
  })

  test("on arrow down, focus next hour", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()

    await I.pressKey("ArrowDown")
    const nextHour = I.getNextHour(current)
    await I.seeHourIsFocused(nextHour)
  })

  test("on arrow up, focus previous hour", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()
    await I.pressKey("ArrowDown", 3)
    await I.pressKey("ArrowUp")

    const nextHour = I.getNextHour(current, 2)
    await I.seeHourIsFocused(nextHour)
  })

  test("keyboard selection, set input value", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()
    // select hour
    await I.pressKey("ArrowDown", 3)
    await I.pressKey("Enter")
    // select minute
    await I.pressKey("ArrowDown", 2)
    await I.pressKey("Enter")
    // select period
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")

    const hour = I.getNextHour(current, 3)
    const minute = I.getNextMinute(current, 2)
    const period = I.getNextPeriod(current)

    await I.seeInputHasValue(`${hour}:${minute} ${period}`)
  })

  test("on arrow right, focus current minute", async () => {
    await I.clickTrigger()
    const current = await I.getCurrentTime()
    await I.pressKey("ArrowRight")
    await I.seeMinuteIsFocused(current.minute)
  })
})
