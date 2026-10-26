import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class StepsModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto() {
    return this.page.goto("/steps/basic")
  }

  private getTrigger = (index: number) => {
    return this.page.locator("[data-scope='steps'][data-part='trigger']").nth(index)
  }

  private getItem = (index: number) => {
    return this.page.locator("[data-scope='steps'][data-part='item']").nth(index)
  }

  clickNext = async () => {
    await this.page.locator("[data-scope='steps'][data-part='next-trigger']").click()
  }

  seeCurrentStep = async (index: number) => {
    await expect(this.getTrigger(index)).toHaveAttribute("aria-current", "step")
    await expect(this.getItem(index)).not.toHaveAttribute("aria-current")
    await expect(this.getItem(index)).toHaveAttribute("data-current")
  }

  seeStepIsNotCurrent = async (index: number) => {
    await expect(this.getTrigger(index)).not.toHaveAttribute("aria-current")
    await expect(this.getItem(index)).not.toHaveAttribute("data-current")
  }

  seeStepIsComplete = async (index: number) => {
    await expect(this.getItem(index)).toHaveAttribute("data-complete")
  }

  seeStepIsIncomplete = async (index: number) => {
    await expect(this.getItem(index)).toHaveAttribute("data-incomplete")
  }
}
