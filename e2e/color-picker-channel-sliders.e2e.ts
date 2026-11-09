import { test } from "./_test"
import { ColorPickerModel } from "./models/color-picker.model"

let I: ColorPickerModel

test.describe("color-picker / hue and alpha sliders", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/channel-sliders")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility(".color-picker")
  })

  test("should render the initial channel values", async () => {
    await I.seeChannelValueText("hue", "210°")
    await I.seeChannelValueText("alpha", "80%")
    await I.seeColorValueText("hsla(210, 90%, 55%, 0.8)")
    await I.seeContentHexInputHasValue("#258CF4")
    await I.seeSwatchColor("rgba(37, 140, 244, 0.8)")
  })

  test("arrow keys on the hue thumb should update the hue", async () => {
    await I.focusChannelThumb("hue")
    await I.pressKey("ArrowRight", 5)
    await I.seeChannelThumbValue("hue", "215")
    await I.seeChannelValueText("hue", "215°")
    await I.seeColorValueText("hsla(215, 90%, 55%, 0.8)")

    await I.pressKey("ArrowLeft", 10)
    await I.seeChannelValueText("hue", "205°")
  })

  test("arrow keys on the alpha thumb should update the alpha", async () => {
    await I.focusChannelThumb("alpha")
    await I.pressKey("ArrowLeft", 3)
    await I.seeChannelThumbValue("alpha", "0.77")
    await I.seeChannelValueText("alpha", "77%")
    await I.seeColorValueText("hsla(210, 90%, 55%, 0.77)")
    await I.seeSwatchColor("rgba(37, 140, 244, 0.77)")
  })

  test("home and end on the hue thumb should jump to the bounds", async () => {
    await I.focusChannelThumb("hue")
    await I.pressKey("Home")
    await I.seeChannelValueText("hue", "0°")
    await I.pressKey("End")
    await I.seeChannelValueText("hue", "360°")
  })

  test("dragging the hue slider should update the color", async () => {
    await I.dragChannelSlider("hue", 0.25)
    await I.seeChannelValueText("hue", "90°")
    await I.seeColorValueText("hsla(90, 90%, 55%, 0.8)")
    await I.seeContentHexInputHasValue("#8CF425")
    await I.seeSwatchColor("rgba(140, 244, 37, 0.8)")
  })

  test("dragging the alpha slider should update the alpha", async () => {
    await I.dragChannelSlider("alpha", 0.4)
    await I.seeChannelValueText("alpha", "40%")
    await I.seeColorValueText("hsla(210, 90%, 55%, 0.4)")
    await I.seeContentHexInputHasValue("#258CF4")
    await I.seeSwatchColor("rgba(37, 140, 244, 0.4)")
  })

  test("clicking a slider label should focus its thumb", async () => {
    await I.clickChannelSliderLabel("alpha")
    await I.seeChannelThumbIsFocused("alpha")
  })

  test("typing a hex value should update the hue slider", async () => {
    await I.typeInContentHex("#ff0000")
    await I.pressKey("Enter")
    await I.seeChannelValueText("hue", "0°")
    await I.seeChannelValueText("alpha", "80%")
  })
})
