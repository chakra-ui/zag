import { test } from "./_test"
import { ColorPickerModel } from "./models/color-picker.model"

let I: ColorPickerModel

test.describe("color-picker / swatches", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/swatches")
  })

  test("should mark the swatch matching the value as checked", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.seeSwatchIsChecked("#3B82F6")
    await I.seeSwatchIndicator("#3B82F6")
  })

  test("should select a swatch and close the picker", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.clickSwatchByValue("#EF4444")
    await I.dontSeeColorPicker()
    await I.seeHexInputHasValue("#EF4444")
    await I.seeTriggerIsFocused()
  })
})

test.describe("color-picker / swatch-only", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/swatch-only")
  })

  test("should update the value text when a swatch is clicked", async () => {
    await I.seeColorValueText("rgba(34, 197, 94, 1)")
    await I.seeSwatchIsChecked("#22C55E")

    await I.clickSwatchByValue("#A855F7")
    await I.seeColorValueText("rgba(168, 85, 247, 1)")
    await I.seeSwatchIsChecked("#A855F7")
    await I.seeSwatchIsNotChecked("#22C55E")
  })
})

test.describe("color-picker / form", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/form")
  })

  test("should submit the hidden input value", async () => {
    await I.seeHiddenInputIsRequired("color")
    await I.clickButton("Submit")
    await I.seeOutput("Submitted value", "rgba(59, 130, 246, 1)")

    await I.commitHex("#ff0000")
    await I.clickButton("Submit")
    await I.seeOutput("Submitted value", "rgba(255, 0, 0, 1)")
  })

  test("should restore the default value on reset", async () => {
    await I.commitHex("#ff0000")
    await I.seeHexInputHasValue("#FF0000")
    await I.clickResetButton()
    await I.seeHexInputHasValue("#3B82F6")
  })
})

test.describe("color-picker / disabled-readonly", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/disabled-readonly")
  })

  test("should not open a disabled picker", async () => {
    await I.seeTriggerIsDisabledIn("Disabled")
    await I.seeHexInputIsDisabledIn("Disabled")
  })

  test("should not open a read-only picker", async () => {
    await I.seeHexInputIsReadOnlyIn("Read-only")
    await I.clickTriggerIn("Read-only")
    await I.dontSeeContentIn("Read-only")
  })

  test("should toggle the invalid state", async () => {
    await I.seeInvalidIn("Invalid", true)
    await I.clickCheckbox("Mark as invalid")
    await I.seeInvalidIn("Invalid", false)
  })
})

test.describe("color-picker / change-end", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/change-end")
  })

  test("should only commit the value when the drag ends", async () => {
    await I.seeOutput("Live value", "#258CF4")
    await I.seeOutput("Committed value", "#258CF4")

    await I.pressAreaThumbAndMoveToLeftEdge()
    await I.dontSeeOutput("Live value", "#258CF4")
    await I.seeOutput("Committed value", "#258CF4")

    await I.releasePointer()
    await I.dontSeeOutput("Committed value", "#258CF4")
    await I.seeOutputsMatch("Live value", "Committed value")
  })

  test("should commit the value on each key press", async () => {
    await I.focusChannelThumb("hue")
    await I.pressKey("ArrowRight")
    await I.seeOutput("Committed value", "#2589F4")

    await I.focusAreaThumb()
    await I.pressKey("ArrowLeft")
    await I.seeOutputsMatch("Live value", "Committed value")
  })

  test("should describe the thumbs with readable values", async () => {
    await I.seeChannelThumbValueText("hue", "210°")
    await I.seeAreaThumbValueText("Saturation 90%, Lightness 55%")
  })

  test("should move the area's y channel with page keys and the x channel with Home and End", async () => {
    await I.focusAreaThumb()
    await I.pressKey("PageUp")
    await I.seeAreaThumbValueText("Saturation 90%, Lightness 65%")

    await I.pressKey("Home")
    await I.seeAreaThumbValueText("Saturation 80%, Lightness 65%")

    await I.pressKey("End")
    await I.seeAreaThumbValueText("Saturation 90%, Lightness 65%")
  })
})

test.describe("color-picker / open-controlled", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/open-controlled")
  })

  test("should open and close from the external button", async () => {
    await I.seeOutput("Open state", "false")

    await I.clickButton("Open picker")
    await I.seeColorPicker()
    await I.seeOutput("Open state", "true")

    await I.clickButton("Close picker")
    await I.dontSeeColorPicker()
    await I.seeOutput("Open state", "false")
  })

  test("should sync the open state when dismissed", async () => {
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.seeOutput("Open state", "true")

    await I.pressKey("Escape")
    await I.dontSeeColorPicker()
    await I.seeOutput("Open state", "false")
  })
})

test.describe("color-picker / channel-inputs", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/channel-inputs")
  })

  test("should start the format select on the default format", async () => {
    await I.seeFormatSelectValue("hsla")
    await I.seeChannelInputs(["hue", "saturation", "lightness", "alpha"])
  })

  test("should render the channel inputs of the active format", async () => {
    await I.seeChannelInputValue("lightness", "60")

    await I.chooseFormat("rgba")
    await I.seeChannelInputs(["red", "green", "blue", "alpha"])
    await I.seeChannelInputValue("red", "59")
    await I.seeChannelInputValue("green", "130")
    await I.seeChannelInputValue("blue", "246")

    await I.chooseFormat("hsba")
    await I.seeChannelInputs(["hue", "saturation", "brightness", "alpha"])
    await I.seeChannelInputValue("brightness", "96")
  })

  test("should update the color from a channel input", async () => {
    await I.chooseFormat("rgba")
    await I.seeChannelInputValue("red", "59")
    await I.commitChannelInput("red", "255")
    await I.seeOutput("Color value", "rgba(255, 130, 246, 1)")
    await I.seeContentHexInputHasValue("#FF82F6")
  })

  test("should step a channel input with the arrow keys", async () => {
    await I.chooseFormat("rgba")
    await I.seeChannelInputValue("red", "59")
    await I.focusChannelInput("red")
    await I.pressKey("ArrowUp", 2)
    await I.seeOutput("Color value", "rgba(61, 130, 246, 1)")

    await I.pressKey("Shift+ArrowDown")
    await I.seeChannelInputValue("red", "51")
  })
})

test.describe("color-picker / input-only", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/input-only")
  })

  test("should update the value from the hex input", async () => {
    await I.seeNoContent()
    await I.seeEyeDropperTrigger()
    await I.commitHex("#00ff00")
    await I.seeColorValueText("rgba(0, 255, 0, 1)")
  })
})

test.describe("color-picker / swatches-with-trigger", () => {
  test.beforeEach(async ({ page }) => {
    I = new ColorPickerModel(page)
    await I.goto("/color-picker/swatches-with-trigger")
  })

  test("should save the current color as a swatch once", async () => {
    await I.seeSwatchCount(3)
    await I.clickTrigger()
    await I.seeColorPicker()
    await I.commitContentHex("#a855f7")
    await I.seeColorValueText("rgba(168, 85, 247, 1)")

    await I.clickButton("Save")
    await I.seeSwatchCount(4)
    await I.seeSwatchIsChecked("#A855F7")

    await I.clickButton("Save")
    await I.seeSwatchCount(4)
  })

  test("should select a preset swatch", async () => {
    await I.clickSwatchByValue("#EF4444")
    await I.seeColorValueText("rgba(239, 68, 68, 1)")
  })
})
