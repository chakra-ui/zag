import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
import { Model } from "./model"

export class TooltipModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "main")
  }

  goto(url = "/tooltip") {
    return this.page.goto(url)
  }

  private getTrigger(id: string) {
    return this.page.locator(testid(id + "-trigger"))
  }

  private getContent(id: string) {
    return this.page.locator(testid(id + "-tooltip"))
  }

  wait = async (ms: number) => {
    await this.page.waitForTimeout(ms)
  }

  hoverTrigger = async (id: string, opts: { wait?: boolean } = {}) => {
    const { wait = true } = opts
    await this.getTrigger(id).hover()
    if (wait) await this.wait(1000)
  }

  hoverOutside = async () => {
    await this.page.mouse.move(0, 0)
  }

  seeContent = async (id: string) => {
    await expect(this.getContent(id)).toBeVisible()
  }

  dontSeeContent = async (id: string) => {
    await expect(this.getContent(id)).not.toBeVisible()
  }

  focusTrigger = async (id: string) => {
    await this.getTrigger(id).focus()
  }

  pointerdownTrigger = async (id: string) => {
    await this.getTrigger(id).dispatchEvent("pointerdown", { button: 0 })
  }

  seeTriggerIsFocused = async (id: string) => {
    await expect(this.getTrigger(id)).toBeFocused()
  }
}
