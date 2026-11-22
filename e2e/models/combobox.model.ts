import { type CDPSession, expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

export class ComboboxModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/combobox/basic") {
    return this.page.goto(url)
  }

  private label: string | undefined

  /** Target the combobox with this label, for pages with several */
  withLabel(label: string) {
    this.label = label
    return this
  }

  private get input() {
    if (this.label) return this.page.getByRole("combobox", { name: this.label })
    return this.page.locator("[data-combobox-input]")
  }

  private cdp: CDPSession | undefined

  /** Updates the pending IME composition text */
  async compose(text: string) {
    this.cdp ??= await this.page.context().newCDPSession(this.page)
    await this.cdp.send("Input.imeSetComposition", { text, selectionStart: text.length, selectionEnd: text.length })
  }

  async commitComposition(text: string) {
    this.cdp ??= await this.page.context().newCDPSession(this.page)
    await this.cdp.send("Input.insertText", { text })
  }

  private get trigger() {
    return this.page.locator("[data-combobox-trigger]")
  }

  private get clearTrigger() {
    return this.page.locator("[data-combobox-clear-trigger]")
  }

  get content() {
    if (this.label) return this.page.getByRole("listbox", { name: this.label, includeHidden: true })
    return this.page.locator("[data-combobox-content]")
  }

  private get items() {
    const options = "[data-combobox-item]:not([data-disabled]):not([hidden])"
    return this.page.locator(options)
  }

  getItem = (text: string) => {
    return this.page.locator("[data-combobox-item]:not([hidden])", { hasText: text })
  }

  get highlightedItem() {
    return this.page.locator("[data-combobox-item][data-highlighted]")
  }

  type(input: string) {
    return this.input.pressSequentially(input)
  }

  clickInput = async () => {
    await this.input.click({ force: true })
  }

  clickTrigger = async (options?: { force?: boolean }) => {
    await this.trigger.click(options)
  }

  clickClearTrigger = async () => {
    await this.clearTrigger.click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover({ force: true })
  }

  clickItem = async (text: string, options?: { force?: boolean }) => {
    await this.getItem(text).click(options)
  }

  focusInput = async () => {
    await this.input.focus()
  }

  seeDropdown = async () => {
    await expect(this.content).toBeVisible()
  }

  closeByClickingOutside = async () => {
    await expect(async () => {
      await this.clickOutside()
      await expect(this.content).toBeHidden({ timeout: 500 })
    }).toPass()
  }

  dontSeeDropdown = async () => {
    await expect(this.content).not.toBeVisible()
  }

  seeItems = async (texts: string[]) => {
    const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    await expect(this.items).toHaveText(texts.map((text) => new RegExp(`^\\W*${escape(text)}\\W*$`)))
  }

  seeNumberOfItems = async (count: number) => {
    const _count = await this.items.count()
    expect(_count).toBe(count)
  }

  seeItemAtIndexIsHighlighted = async (index: number) => {
    await expect(this.page.locator("[data-combobox-item]").nth(index)).toHaveAttribute("data-highlighted", "")
  }

  seeItemIsHighlighted = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-highlighted", "")
  }

  seeItemIsChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-state", "checked")
  }

  seeItemIsNotChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).not.toHaveAttribute("data-state", "checked")
  }

  seeItemIsSelected = async (text: string) => {
    await expect(this.getItem(text)).toHaveAttribute("aria-selected", "true")
  }

  seeItemIsNotSelected = async (text: string) => {
    await expect(this.getItem(text)).toHaveAttribute("aria-selected", "false")
  }

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    await expect.poll(() => isInViewport(this.content, item)).toBe(true)
  }

  seeInputHasValue = async (value: string) => {
    await expect(this.input).toHaveValue(value)
  }

  dontSeeInputIsFocused = async () => {
    await expect(this.input).not.toBeFocused()
  }

  seeInputIsFocused = async () => {
    await expect(this.input).toBeFocused()
  }

  private get chips() {
    return this.page.locator("[data-combobox-chip]")
  }

  getChip = (label: string) => {
    return this.chips.filter({ hasText: label })
  }

  seeChips = async (labels: string[]) => {
    await expect(this.chips).toHaveText(labels)
  }

  seeChipIsFocused = async (label: string) => {
    await expect(this.getChip(label)).toBeFocused()
  }

  /** Presses the chip group's padding, beside the chips */
  clickChipGroupSpace = async () => {
    await this.page.locator("[data-combobox-chip-group]").click({ position: { x: 2, y: 2 } })
  }

  clickChipDeleteTrigger = async (label: string) => {
    await this.page.getByRole("button", { name: `Delete ${label}` }).click()
  }

  clickLabel = async () => {
    await this.page.locator("[data-combobox-label]").click()
  }

  clickSubmit = async () => {
    await this.page.getByRole("button", { name: "Submit" }).click()
  }

  seeItem = async (text: string) => {
    await expect(this.getItem(text)).toBeVisible()
  }

  seeInputIsDisabled = async () => {
    await expect(this.input).toBeDisabled()
  }

  seeInputIsReadOnly = async () => {
    await expect(this.input).toHaveAttribute("readonly", "")
  }

  /** `aria-activedescendant` points at the highlighted option */
  seeActiveDescendantIsHighlighted = async () => {
    const id = await this.highlightedItem.getAttribute("id")
    await expect(this.input).toHaveAttribute("aria-activedescendant", id!)
  }

  seeHighlightedItem = async () => {
    await expect(this.highlightedItem).toBeVisible()
  }

  dontSeeItem = async (text: string) => {
    await expect(this.getItem(text)).not.toBeVisible()
  }

  fillInput = async (text: string) => {
    await this.input.fill("")
    await this.input.pressSequentially(text)
  }

  get list() {
    return this.page.locator("[data-combobox-list]")
  }

  scrollListToBottom = async () => {
    await this.list.evaluate((el) => (el.scrollTop = el.scrollHeight))
  }

  private listScrollTop = () => this.list.evaluate((el) => el.scrollTop)

  seeListIsScrolled = async () => {
    await expect.poll(this.listScrollTop).toBeGreaterThan(0)
  }

  seeListIsScrolledToTop = async () => {
    await expect.poll(this.listScrollTop).toBe(0)
  }

  seeListIsBusy = async () => {
    await expect(this.list).toHaveAttribute("aria-busy", "true")
  }

  dontSeeListIsBusy = async () => {
    await expect(this.list).not.toHaveAttribute("aria-busy")
  }

  async waitForNewPage(action: () => Promise<unknown>) {
    const [newPage] = await Promise.all([this.page.context().waitForEvent("page"), action()])
    return newPage
  }

  clickItemWithModifiers = async (text: string, modifiers: Array<"Alt" | "ControlOrMeta" | "Shift">) => {
    await this.getItem(text).click({ modifiers })
  }

  seeSelection = async (expected: Record<string, unknown>) => {
    const read = async () => JSON.parse((await this.testId("selection").textContent()) ?? "null")
    await expect.poll(read).toMatchObject(expected)
  }

  seeSelectedText = async (text: string, id = "selected-items") => {
    await expect(this.testId(id)).toContainText(text)
  }

  dontSeeSelectedText = async (text: string, id = "selected-items") => {
    await expect(this.testId(id)).not.toContainText(text)
  }

  dontSeeHighlightedItem = async () => {
    await expect(this.highlightedItem).toHaveCount(0)
  }

  get valueText() {
    return this.page.locator("[data-testid=value-text]")
  }

  seeValueText = async (text: string) => {
    await expect(this.valueText).toContainText(text)
  }

  dontSeeValueText = async () => {
    await expect(this.valueText).toHaveText("")
  }

  get valueChangeText() {
    return this.page.locator("[data-testid=on-value-change-items]")
  }

  seeOnValueChangeItems = async (text: string) => {
    await expect(this.valueChangeText).toContainText(text)
  }

  seeOnValueChangeItemsIsEmpty = async () => {
    await expect(this.valueChangeText).toContainText("N/A")
  }

  get submitCount() {
    return this.page.locator("[data-testid=submit-count]")
  }

  get lastSubmit() {
    return this.page.locator("[data-testid=last-submit]")
  }

  seeSubmitCount = async (count: number) => {
    await expect(this.submitCount).toHaveText(String(count))
  }

  seeLastSubmit = async (value: string) => {
    await expect(this.lastSubmit).toHaveText(value)
  }
}
