import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class AutocompleteModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/autocomplete/basic") {
    return this.page.goto(url)
  }

  private get input() {
    return this.page.locator("[data-autocomplete-input]")
  }

  getItem = (text: string) => {
    return this.page.locator("[data-autocomplete-item]", { hasText: text })
  }

  private get highlightedItem() {
    return this.page.locator("[data-autocomplete-item][data-highlighted]")
  }

  async type(text: string) {
    await this.input.focus()
    await this.page.keyboard.type(text)
  }

  seeInputHasValue = async (value: string) => {
    await expect(this.input).toHaveValue(value)
  }

  /** The input's selected text, as `[start, end]` */
  seeInputSelection = async (start: number, end: number) => {
    const getSelection = () => this.input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])
    await expect.poll(getSelection).toEqual([start, end])
  }

  seeInputMode = async (mode: string) => {
    await expect(this.input).toHaveAttribute("aria-autocomplete", mode)
  }

  seeItem = async (text: string) => {
    await expect(this.getItem(text)).toBeVisible()
  }

  dontSeeItem = async (text: string) => {
    await expect(this.getItem(text)).toHaveCount(0)
  }

  seeItemIsHighlighted = async (text: string) => {
    await expect(this.getItem(text)).toHaveAttribute("data-highlighted", "")
  }

  dontSeeHighlightedItem = async () => {
    await expect(this.highlightedItem).toHaveCount(0)
  }

  /** The input shows the highlighted item's text */
  seeInputShowsHighlightedItem = async () => {
    const text = (await this.highlightedItem.textContent())?.trim() ?? ""
    await this.seeInputHasValue(text)
  }

  get content() {
    return this.page.locator("[data-autocomplete-content]")
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  clickTrigger = async (options?: { force?: boolean }) => {
    await this.page.locator("[data-autocomplete-trigger]").click(options)
  }

  clickClearTrigger = async () => {
    await this.page.locator("[data-autocomplete-clear-trigger]").click()
  }

  clickSubmit = async () => {
    await this.page.getByRole("button", { name: "Submit" }).click()
  }

  seeDropdown = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeDropdown = async () => {
    await expect(this.content).not.toBeVisible()
  }

  seeInputIsFocused = async () => {
    await expect(this.input).toBeFocused()
  }

  seeInputIsDisabled = async () => {
    await expect(this.input).toBeDisabled()
  }

  seeSubmitted = async (value: string | null) => {
    const text = value == null ? "—" : JSON.stringify(value)
    await expect(this.page.getByTestId("output")).toContainText(`submitted: ${text}`)
  }

  seeValue = async (value: string) => {
    await expect(this.page.getByTestId("output")).toContainText(`value: ${JSON.stringify(value)}`)
  }
}
