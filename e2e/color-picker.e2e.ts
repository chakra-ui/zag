import { test } from "@playwright/test"
import { ColorPickerModel } from "./models/color-picker.model"

const INITIAL_VALUE = "#FF0000"
const PINK_VALUE = "#FFC0CB"
const FIRST_SWATCH_VALUE = "#F47373"

let I: ColorPickerModel

test.describe("color-picker", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility(".color-picker")
  })

  test("[closed] typing the same native css colors switch show hex", async () => {
    await I.type("red")
    await I.pressKey("Enter")
    await I.clickOutside()
    await I.seeHexInputHasValue(INITIAL_VALUE)
  })

  test("[closed] typing different native css colors should update color", async () => {
    await I.type("pink")
    await I.pressKey("Enter")
    await I.clickOutside()
    await I.seeHexInputHasValue(PINK_VALUE)
  })

  test("[closed] typing in alpha should update color", async () => {
    await I.typeInAlphaInput("0.3")
    await I.pressKey("Enter")
    await I.seeValueText("hsla(0, 100%, 50%, 0.3)")
  })

  test("click on trigger should open picker", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
  })

  test("should re-focus trigger on outside click", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()

    await I.clickOutside()
    await I.seeTriggerIsFocused()
  })

  test("opening the picker should focus area", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.seeAreaThumbIsFocused()
  })

  test("keyboard focus movement", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.seeAreaThumbIsFocused()

    await I.pressKey("Tab")
    await I.seeChannelThumbIsFocused("hue")

    await I.pressKey("Tab")
    await I.seeChannelThumbIsFocused("alpha")
  })

  test("[swatch] should set value on click swatch", async () => {
    await I.clickTrigger()
    await I.clickFirstSwatch()
    await I.seeHexInputHasValue(FIRST_SWATCH_VALUE)
  })

  test("[form] should reset value to initial on reset", async () => {
    await I.clickTrigger()

    await I.clickFirstSwatch()
    await I.clickOutside()

    await I.clickResetButton()
    await I.seeHexInputHasValue(INITIAL_VALUE)
  })

  // test.fixme("hsl channel inputs should work as expected", async ({ page, parts }) => {
  //   await parts.trigger.click()

  //   const hue = parts.channelInput("hue")
  //   const saturation = parts.channelInput("saturation")
  //   const lightness = parts.channelInput("lightness")
  //   const alpha = parts.channelInput("alpha").nth(1)

  //   await hue.fill("20")
  //   await page.keyboard.press("Enter")
  //   await expect(parts.valueText).toContainText("hsla(20, 100%, 50%, 1)")

  //   await saturation.fill("56")
  //   await page.keyboard.press("Enter")
  //   await expect(parts.valueText).toContainText("hsla(20, 56%, 50%, 1)")

  //   await lightness.fill("78")
  //   await page.keyboard.press("Enter")
  //   await expect(parts.valueText).toContainText("hsla(20, 56%, 78%, 1)")

  //   await alpha.fill("0.5")
  //   await page.keyboard.press("Enter")
  //   await expect(parts.valueText).toContainText("hsla(20, 56%, 78%, 0.5)")
  // })

  test("[slider] should change hue when clicking the hue bar", async () => {
    await I.clickTrigger()
    await I.clickChannelSlider("hue")
    await I.seeValueText("hsla(180, 100%, 50%, 1)")
  })

  test("[slider] should change alpha when clicking the alpha bar", async () => {
    await I.clickTrigger()
    await I.clickChannelSlider("alpha")
    await I.seeValueText("hsla(0, 100%, 50%, 0.5)")
  })
})
