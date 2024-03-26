import { expect, type Page } from "@playwright/test"
import { Model } from "./model"
import { part } from "../_utils"

type Channel = "red" | "green" | "blue" | "alpha" | "hue" | "saturation" | "lightness" | "brightness"

export class ColorPickerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/color-picker")
  }

  private get trigger() {
    return this.page.locator(part("trigger"))
  }

  private get content() {
    return this.page.locator(part("content"))
  }

  private get hexInput() {
    return this.page.locator(`[data-part=control] [data-channel=hex]`)
  }

  private get alphaInput() {
    return this.page.locator(`[data-part=control] [data-channel=alpha]`)
  }

  private get areaThumb() {
    return this.page.locator(part("area-thumb"))
  }

  channelInput(channel: string) {
    return this.page.locator(`[data-part=channel-input][data-channel=${channel}]`)
  }

  channelThumb(channel: string) {
    return this.page.locator(`[data-part=channel-slider-thumb][data-channel=${channel}]`)
  }

  channelSlider(channel: string) {
    return this.page.locator(`[data-part=channel-slider][data-channel=${channel}]`)
  }

  private get swatchTriggers() {
    return this.page.locator(part("swatch-trigger"))
  }

  private get resetButton() {
    return this.page.getByRole("button", { name: "Reset" })
  }

  private get valueText() {
    return this.page.getByTestId("value-text").first()
  }

  typeInHexInput(value: string) {
    return this.hexInput.fill(value)
  }

  seeHexInputHasValue(value: string) {
    return expect(this.hexInput).toHaveValue(value)
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

  clickFirstSwatch() {
    return this.swatchTriggers.first().click()
  }

  clickResetButton() {
    return this.resetButton.click()
  }

  clickChannelSlider(channel: Channel) {
    return this.channelSlider(channel).click()
  }
}
