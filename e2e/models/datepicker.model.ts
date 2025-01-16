import {
  getLocalTimeZone,
  parseDate,
  today,
  startOfMonth,
  endOfMonth,
  DateFormatter,
  CalendarDate,
} from "@internationalized/date"
import { type Page, expect } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

interface DayCellOptions {
  current?: string
  step?: number
}

function interpret(date: CalendarDate) {
  const timeZone = getLocalTimeZone()
  const nativeDate = date.toDate(getLocalTimeZone())

  // same formatter as datepicker machine
  const ft = new DateFormatter("en", {
    timeZone: timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return {
    native: nativeDate,
    iso: nativeDate.toISOString().split("T")[0],
    formatted: ft.format(nativeDate),
  }
}

export class DatePickerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[data-part=content]")
  }

  private today() {
    return today(getLocalTimeZone())
  }

  getDate(opts: { day?: number; month?: number; year?: number }) {
    return interpret(this.today().set(opts))
  }

  goto(url = "/date-picker") {
    return this.page.goto(url)
  }

  get trigger() {
    return this.page.locator("[data-scope=date-picker][data-part=trigger]")
  }

  getInput(index = 0) {
    const selector = `[data-scope=date-picker][data-part=input][data-index="${index}"]`
    return this.page.locator(selector)
  }

  get content() {
    return this.page.locator("[data-scope=date-picker][data-part=content]")
  }

  get monthSelect() {
    return this.page.locator("[data-scope=date-picker][data-part=month-select]")
  }

  get yearSelect() {
    return this.page.locator("[data-scope=date-picker][data-part=year-select]")
  }

  get prevTrigger() {
    return this.page.locator("[data-scope=date-picker][data-part=prev-trigger]")
  }

  get nextTrigger() {
    return this.page.locator("[data-scope=date-picker][data-part=next-trigger]")
  }

  get table() {
    return this.page.locator("[data-scope=date-picker][data-part=table]")
  }

  get todayCell() {
    return this.page.locator("[data-scope=date-picker][data-part=table-cell-trigger][data-today]")
  }

  get firstDayCell() {
    const start = startOfMonth(this.today())
    return this.page.locator(`${part("table-cell-trigger")}[data-view=day][data-value="${start.toString()}"]`)
  }

  get lastDayCell() {
    const end = endOfMonth(this.today())
    return this.page.locator(`${part("table-cell-trigger")}[data-view=day][data-value="${end.toString()}"]`)
  }

  getNextDayCell(opts: DayCellOptions = {}) {
    const { current, step = 1 } = opts
    const now = current ? parseDate(current) : this.today()
    const next = now.add({ days: step })
    return this.page.locator(`${part("table-cell-trigger")}[data-view=day][data-value="${next.toString()}"]`)
  }

  getPrevDayCell(opts: DayCellOptions = {}) {
    const { current, step = 1 } = opts
    const now = current ? parseDate(current) : this.today()
    const prev = now.add({ days: -1 * step })
    return this.page.locator(`${part("table-cell-trigger")}[data-view=day][data-value="${prev.toString()}"]`)
  }

  getDayCell(value: string | number) {
    const date = this.today().set({ day: +value }).toDate(getLocalTimeZone())
    const v = date.toISOString().split("T")[0]
    return this.page.locator(`${part("table-cell-trigger")}[data-view=day][data-value="${v}"]`)
  }

  getMonthCell(value: string | number) {
    return this.page.locator(`${part("table-cell-trigger")}[data-view=month][data-value="${value}"]`)
  }

  getYearCell(value: string | number) {
    return this.page.locator(`${part("table-cell-trigger")}[data-view=year][data-value="${value}"]`)
  }

  clickTrigger() {
    return this.trigger.click()
  }

  type(value: string, index = 0) {
    return this.getInput(index).pressSequentially(value)
  }

  focusInput(index = 0) {
    return this.getInput(index).focus()
  }

  async clearInput(index = 0) {
    await this.focusInput(index)
    await this.pressKey("ControlOrMeta+A")
    await this.pressKey("Backspace")
  }

  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  clickTodayCell() {
    return this.todayCell.click()
  }

  clickDayCell(value: string | number) {
    return this.getDayCell(value).click()
  }

  seeTodayCellIsFocused() {
    return expect(this.todayCell).toBeFocused()
  }

  seePrevDayCellIsFocused(opts?: DayCellOptions) {
    return expect(this.getPrevDayCell(opts)).toBeFocused()
  }

  seeNextDayCellIsFocused(opts?: DayCellOptions) {
    return expect(this.getNextDayCell(opts)).toBeFocused()
  }

  seeFirstDayCellIsFocused() {
    return expect(this.firstDayCell).toBeFocused()
  }

  seeLastDayCellIsFocused() {
    return expect(this.lastDayCell).toBeFocused()
  }

  seeInputHasValue(value: string, index?: number) {
    return expect(this.getInput(index)).toHaveValue(value)
  }

  seeInputIsFocused(index?: number) {
    return expect(this.getInput(index)).toBeFocused()
  }

  seeSelectedValue(value: string) {
    return expect(this.page.locator(".date-output")).toContainText(`Selected: ${value}`)
  }

  seeFocusedValue(value: string) {
    return expect(this.page.locator(".date-output")).toContainText(`Focused: ${value}`)
  }
}
