import { expect, type Page } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

interface CurrentTime {
  hour: string
  minute: string
  second: string
  period: string
}

export class TimePickerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  async checkAccessibility() {
    await this.trigger.click()
    return a11y(this.page, "[data-part=content]")
  }

  goto() {
    return this.page.goto("/time-picker")
  }

  getNextHour(current: CurrentTime, step = 1) {
    let next = parseInt(current.hour) + step
    if (next > 12) next = 1
    if (next < 1) next = 12
    return next.toString().padStart(2, "0")
  }

  getNextMinute(current: CurrentTime, step = 1) {
    let next = parseInt(current.minute) + step
    if (next > 59) next = 0
    if (next < 0) next = 59
    return next.toString().padStart(2, "0")
  }

  getNextSecond(current: CurrentTime, step = 1) {
    let next = parseInt(current.second) + step
    if (next > 59) next = 0
    if (next < 0) next = 59
    return next.toString().padStart(2, "0")
  }

  getNextPeriod(current: CurrentTime, step = 1) {
    if (current.period === "PM" && step === 1) return "PM"
    if (current.period === "AM" && step === -1) return "AM"
    return current.period === "AM" ? "PM" : "AM"
  }

  async getCurrentTime() {
    return this.page.evaluate(() => {
      const pad = (value: number) => value.toString().padStart(2, "0")
      const date = new Date()

      let hour = date.getHours()
      if (hour > 12) hour -= 12
      if (hour === 0) hour = 12

      let minute = date.getMinutes()
      let second = date.getSeconds()

      return {
        hour: pad(hour),
        minute: pad(minute),
        second: pad(second),
        period: date.getHours() >= 12 ? "PM" : "AM",
      }
    })
  }

  private get trigger() {
    return this.page.locator(part("trigger"))
  }

  private get content() {
    return this.page.locator(part("content"))
  }

  private get input() {
    return this.page.locator(part("input"))
  }

  private get clearTrigger() {
    return this.page.locator(part("clear-trigger"))
  }

  private getHourCell = (hasText: string) => {
    return this.page.locator(`[data-part=cell][data-unit=hour]`, { hasText })
  }

  private getMinuteCell = (hasText: string) => {
    return this.page.locator(`[data-part=cell][data-unit=minute]`, { hasText })
  }

  private getSecondCell = (hasText: string) => {
    return this.page.locator(`[data-part=cell][data-unit=second]`, { hasText })
  }

  private getPeriodCell = (hasText: "AM" | "PM") => {
    return this.page.locator(`[data-part=cell][data-unit=period]`, { hasText })
  }

  type = async (value: string) => {
    await this.input.fill(value)
  }

  clickHourCell = async (hasText: string) => {
    await this.getHourCell(hasText).click()
  }

  clickMinuteCell = async (hasText: string) => {
    await this.getMinuteCell(hasText).click()
  }

  clickSecondCell = async (hasText: string) => {
    await this.getSecondCell(hasText).click()
  }

  clickPeriodCell = async (hasText: "AM" | "PM") => {
    await this.getPeriodCell(hasText).click()
  }

  clickTrigger = async () => {
    await this.trigger.click()
  }

  clickClearTrigger = async () => {
    await this.clearTrigger.click()
  }

  seeInputHasValue = async (hasValue: string) => {
    await expect(this.input).toHaveValue(hasValue)
  }

  seeContent = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeContent = async () => {
    await expect(this.content).not.toBeVisible()
  }

  seeHourIsFocused = async (hasText: string) => {
    await expect(this.getHourCell(hasText)).toBeFocused()
  }

  seeMinuteIsFocused = async (hasText: string) => {
    await expect(this.getMinuteCell(hasText)).toBeFocused()
  }

  seeSecondIsFocused = async (hasText: string) => {
    await expect(this.getSecondCell(hasText)).toBeFocused()
  }

  seePeriodIsFocused = async (hasText: "AM" | "PM") => {
    await expect(this.getPeriodCell(hasText)).toBeFocused()
  }

  seeInputIsFocused = async () => {
    await expect(this.input).toBeFocused()
  }
}
