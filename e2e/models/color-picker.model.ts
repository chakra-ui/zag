import { expect, type Page } from "@playwright/test"
import { Model } from "./model"
import { part, rect } from "../_utils"

type Channel = "red" | "green" | "blue" | "alpha" | "hue" | "saturation" | "lightness" | "brightness"

export class ColorPickerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/color-picker/basic") {
    return this.page.goto(url)
  }

  gotoInline() {
    return this.page.goto("/color-picker/inline")
  }

  private get trigger() {
    return this.page.locator(part("color-picker", "trigger"))
  }

  private get content() {
    return this.page.locator(part("color-picker", "content"))
  }

  private get hexInput() {
    return this.page.locator(`[data-color-picker-control] [data-channel=hex]`)
  }

  private get contentHexInput() {
    return this.content.locator(`[data-channel=hex]`)
  }

  private get alphaInput() {
    return this.page.locator(`[data-color-picker-control] [data-channel=alpha]`)
  }

  private get areaThumb() {
    return this.page.locator(part("color-picker", "area-thumb"))
  }

  private get area() {
    return this.page.locator(part("color-picker", "area"))
  }

  channelInput(channel: string) {
    return this.page.locator(`[data-color-picker-channel-input][data-channel=${channel}]`)
  }

  channelThumb(channel: string) {
    return this.page.locator(`[data-color-picker-channel-slider-thumb][data-channel=${channel}]`)
  }

  channelSlider(channel: string) {
    return this.page.locator(`[data-color-picker-channel-slider][data-channel=${channel}]`)
  }

  channelValueText(channel: string) {
    return this.page.locator(`[data-color-picker-channel-slider-value-text][data-channel=${channel}]`)
  }

  private get colorValueText() {
    return this.page.locator(part("color-picker", "value-text"))
  }

  private get contentSwatch() {
    return this.content.locator(part("color-picker", "swatch"))
  }

  private get swatchTriggers() {
    return this.page.locator(part("color-picker", "swatch-trigger"))
  }

  private get resetButton() {
    return this.page.getByRole("button", { name: "Reset" })
  }

  private get valueText() {
    return this.page.getByTestId("value-text").first()
  }

  type(value: string) {
    return this.hexInput.fill(value)
  }

  seeHexInputHasValue(value: string) {
    return expect(this.hexInput).toHaveValue(value)
  }

  typeInContentHex(value: string) {
    return this.contentHexInput.fill(value)
  }

  seeContentHexInputHasValue(value: string) {
    return expect(this.contentHexInput).toHaveValue(value)
  }

  typeInAlphaInput(value: string) {
    return this.alphaInput.fill(value)
  }

  seeAlphaInputHasValue(value: string) {
    return expect(this.alphaInput).toHaveValue(value)
  }

  seeValueText(value: string) {
    return expect(this.valueText).toContainText(value)
  }

  seeChannelValueText(channel: Channel, value: string) {
    return expect(this.channelValueText(channel)).toHaveText(value)
  }

  seeColorValueText(value: string) {
    return expect(this.colorValueText).toHaveText(value)
  }

  seeSwatchColor(color: string) {
    return expect(this.contentSwatch).toHaveCSS("background-color", color)
  }

  seeChannelThumbValue(channel: Channel, value: string) {
    return expect(this.channelThumb(channel)).toHaveAttribute("aria-valuenow", value)
  }

  focusChannelThumb(channel: Channel) {
    return this.channelThumb(channel).focus()
  }

  clickChannelSliderLabel(channel: Channel) {
    return this.page.locator(`[data-color-picker-channel-slider-label][data-channel=${channel}]`).click()
  }

  async dragChannelSlider(channel: Channel, percent: number) {
    const thumbBox = await rect(this.channelThumb(channel))
    const trackBox = await rect(this.page.locator(`[data-color-picker-channel-slider-track][data-channel=${channel}]`))

    await this.page.mouse.move(thumbBox.midX, thumbBox.midY)
    await this.page.mouse.down()
    await this.page.mouse.move(trackBox.x + trackBox.width * percent, trackBox.midY, { steps: 10 })
    await this.page.mouse.up()
  }

  clickTrigger() {
    return this.trigger.click()
  }

  seeColorPicker() {
    return expect(this.content).toBeVisible()
  }

  dontSeeColorPicker() {
    return expect(this.content).not.toBeVisible()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }

  seeAreaThumbIsFocused() {
    return expect(this.areaThumb).toBeFocused()
  }

  seeChannelThumbIsFocused(channel: Channel) {
    return expect(this.channelThumb(channel)).toBeFocused()
  }

  seeAreaThumbIsDisabled() {
    return expect(this.areaThumb).toHaveAttribute("aria-disabled", "true")
  }

  seeChannelThumbIsDisabled(channel: Channel) {
    return expect(this.channelThumb(channel)).toHaveAttribute("aria-disabled", "true")
  }

  clickFirstSwatch() {
    return this.swatchTriggers.first().click()
  }

  clickSwatch(index: number) {
    return this.swatchTriggers.nth(index).click()
  }

  clickResetButton() {
    return this.resetButton.click()
  }

  clickChannelSlider(channel: Channel) {
    return this.channelSlider(channel).click()
  }

  async selectFormat(format: string) {
    await this.controls.select("format", format)
  }

  async commitContentHex(value: string) {
    await this.contentHexInput.fill(value)
    await this.contentHexInput.press("Enter")
  }

  async dragAreaToLeftEdge() {
    const bounds = await this.getAreaBounds()
    await this.dragAreaToPoint({ x: bounds.x + 1, y: bounds.y + bounds.height / 2 })
  }

  async getAreaBounds() {
    return rect(this.area)
  }

  async dragAreaToPoint(point: { x: number; y: number }) {
    const thumbBox = await this.areaThumb.boundingBox()
    if (!thumbBox) throw new Error("Color area thumb not found")

    const startX = thumbBox.x + thumbBox.width / 2
    const startY = thumbBox.y + thumbBox.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(point.x, point.y, { steps: 10 })
    await this.page.mouse.up()
  }

  pickerRoot(label: string) {
    return this.page.locator(part("color-picker", "root")).filter({
      has: this.page.locator(part("color-picker", "label")).getByText(label, { exact: true }),
    })
  }

  private hexInputIn(label: string) {
    return this.pickerRoot(label).locator(`[data-color-picker-control] [data-channel=hex]`)
  }

  swatchTrigger(value: string) {
    return this.page.locator(`${part("color-picker", "swatch-trigger")}[data-value="${value}"]`)
  }

  output(label: string) {
    return this.page.getByLabel(label, { exact: true })
  }

  clickButton(name: string) {
    return this.page.getByRole("button", { name, exact: true }).click()
  }

  clickCheckbox(name: string) {
    return this.page.getByRole("checkbox", { name }).click()
  }

  clickSwatchByValue(value: string) {
    return this.swatchTrigger(value).click()
  }

  async seeSwatchIsChecked(value: string) {
    await expect(this.swatchTrigger(value)).toHaveAttribute("data-state", "checked")
    await expect(this.swatchTrigger(value)).toHaveAttribute("aria-pressed", "true")
  }

  async seeSwatchIsNotChecked(value: string) {
    await expect(this.swatchTrigger(value)).toHaveAttribute("data-state", "unchecked")
    await expect(this.swatchTrigger(value)).toHaveAttribute("aria-pressed", "false")
  }

  seeSwatchIndicator(value: string) {
    return expect(this.swatchTrigger(value).locator(part("color-picker", "swatch-indicator"))).toBeVisible()
  }

  seeSwatchCount(count: number) {
    return expect(this.swatchTriggers).toHaveCount(count)
  }

  seeOutput(label: string, value: string) {
    return expect(this.output(label)).toHaveText(value)
  }

  dontSeeOutput(label: string, value: string) {
    return expect(this.output(label)).not.toHaveText(value)
  }

  async seeOutputsMatch(source: string, target: string) {
    const value = await this.output(source).textContent()
    await expect(this.output(target)).toHaveText(value ?? "")
  }

  private get formatSelect() {
    return this.page.locator(part("color-picker", "format-select"))
  }

  chooseFormat(format: string) {
    return this.formatSelect.selectOption(format)
  }

  seeFormatSelectValue(format: string) {
    return expect(this.formatSelect).toHaveValue(format)
  }

  seeChannelInputs(channels: string[]) {
    return expect(this.page.locator(`${part("color-picker", "channel-input")}:not([data-channel=hex])`)).toHaveCount(
      channels.length,
    )
  }

  seeChannelInputValue(channel: string, value: string) {
    return expect(this.channelInput(channel)).toHaveValue(value)
  }

  async commitChannelInput(channel: string, value: string) {
    await this.channelInput(channel).fill(value)
    await this.channelInput(channel).press("Enter")
  }

  async commitHex(value: string) {
    await this.hexInput.fill(value)
    await this.hexInput.press("Enter")
  }

  seeNoContent() {
    return expect(this.content).toHaveCount(0)
  }

  seeEyeDropperTrigger() {
    return expect(this.page.locator(part("color-picker", "eye-dropper-trigger"))).toBeVisible()
  }

  seeHiddenInputIsRequired(name: string) {
    return expect(this.page.locator(`input[name="${name}"]`)).toHaveAttribute("required", "")
  }

  seeTriggerIsDisabledIn(label: string) {
    return expect(this.pickerRoot(label).locator(part("color-picker", "trigger"))).toBeDisabled()
  }

  clickTriggerIn(label: string) {
    return this.pickerRoot(label).locator(part("color-picker", "trigger")).click()
  }

  dontSeeContentIn(label: string) {
    return expect(this.pickerRoot(label).locator(part("color-picker", "content"))).toBeHidden()
  }

  seeHexInputIsDisabledIn(label: string) {
    return expect(this.hexInputIn(label)).toBeDisabled()
  }

  seeHexInputIsReadOnlyIn(label: string) {
    return expect(this.hexInputIn(label)).toHaveAttribute("readonly", "")
  }

  async seeInvalidIn(label: string, invalid: boolean) {
    const root = this.pickerRoot(label)
    if (invalid) {
      await expect(root).toHaveAttribute("data-invalid", "")
      await expect(this.hexInputIn(label)).toHaveAttribute("aria-invalid", "true")
      await expect(root.getByText("Pick a color with enough contrast")).toBeVisible()
    } else {
      await expect(root).not.toHaveAttribute("data-invalid")
      await expect(this.hexInputIn(label)).not.toHaveAttribute("aria-invalid")
      await expect(root.getByText("Pick a color with enough contrast")).toHaveCount(0)
    }
  }

  async pressAreaThumbAndMoveToLeftEdge() {
    const thumb = await rect(this.areaThumb)
    const bounds = await this.getAreaBounds()
    await this.page.mouse.move(thumb.midX, thumb.midY)
    await this.page.mouse.down()
    await this.page.mouse.move(bounds.x + 1, bounds.midY, { steps: 10 })
  }

  focusAreaThumb() {
    return this.areaThumb.focus()
  }

  seeAreaThumbValueText(text: string) {
    return expect(this.areaThumb).toHaveAttribute("aria-valuetext", text)
  }

  seeChannelThumbValueText(channel: string, text: string) {
    return expect(this.channelThumb(channel)).toHaveAttribute("aria-valuetext", text)
  }

  focusChannelInput(channel: string) {
    return this.channelInput(channel).focus()
  }

  releasePointer() {
    return this.page.mouse.up()
  }
}
