import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class MenubarModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[role=menubar]")
  }

  goto(url = "/menubar/basic") {
    return this.page.goto(url)
  }

  private get root() {
    return this.page.locator("[role=menubar]")
  }

  trigger(id: string) {
    return this.page.locator(`[data-testid="${id}:trigger"]`)
  }

  content(id: string) {
    return this.page.locator(`[data-testid="${id}:content"]`)
  }

  focusTrigger = async (id: string) => {
    await this.trigger(id).focus()
  }

  clickTrigger = async (id: string) => {
    await this.trigger(id).click()
  }

  hoverTrigger = async (id: string) => {
    await this.trigger(id).hover()
  }

  seeTriggerIsFocused = async (id: string) => {
    await expect(this.trigger(id)).toBeFocused()
  }

  seeTriggerIsTabbable = async (id: string) => {
    await expect(this.trigger(id)).toHaveAttribute("tabindex", "0")
  }

  seeTriggerIsNotTabbable = async (id: string) => {
    await expect(this.trigger(id)).toHaveAttribute("tabindex", "-1")
  }

  seeMenuIsOpen = async (id: string) => {
    await expect(this.content(id)).toBeVisible()
    await expect(this.trigger(id)).toHaveAttribute("aria-expanded", "true")
  }

  seeMenuIsClosed = async (id: string) => {
    await expect(this.content(id)).toBeHidden()
    await expect(this.trigger(id)).toHaveAttribute("aria-expanded", "false")
  }

  seeHasOpenMenu = async (value: boolean) => {
    await expect(this.root).toHaveAttribute("data-has-open-menu", value ? "true" : "false")
  }

  seeMenubarRole = async () => {
    await expect(this.root).toHaveAttribute("aria-orientation", "horizontal")
    await expect(this.trigger("file")).toHaveAttribute("role", "menuitem")
    await expect(this.trigger("file")).toHaveAttribute("aria-haspopup", "menu")
  }

  seeMenubarIsDisabled = async () => {
    await expect(this.root).toHaveAttribute("aria-disabled", "true")
  }

  seeItemIsHighlighted = async (testId: string) => {
    await expect(this.page.locator(`[data-testid="${testId}"]`)).toHaveAttribute("data-highlighted", "")
  }

  seeSubmenuIsOpen = async (testId: string) => {
    await expect(this.page.locator(`[data-testid="${testId}"]`)).toBeVisible()
  }

  seeSubmenuIsClosed = async (testId: string) => {
    await expect(this.page.locator(`[data-testid="${testId}"]`)).toBeHidden()
  }

  seeTriggerIsDisabled = async (id: string) => {
    await expect(this.trigger(id)).toBeDisabled()
  }
}
