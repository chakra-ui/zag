import { test } from "@playwright/test"
import { SliderModel } from "./models/slider.model"

let I: SliderModel

test.describe("slider", () => {
  test.beforeEach(async ({ page }) => {
    I = new SliderModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[keyboard] should work with arrow left/right keys", async () => {
    await I.focusThumb()

    await I.pressKey("ArrowRight")
    await I.seeValueText("1")

    await I.pressKey("ArrowRight")
    await I.seeValueText("2")
  })

  test("[keyboard] should work with home/end keys", async () => {
    await I.focusThumb()
    await I.pressKey("ArrowRight", 2)

    await I.pressKey("Home")
    await I.seeValueText("0")

    await I.pressKey("End")
    await I.seeValueText("100")
  })

  test("[keyboard] should work with shift key", async () => {
    await I.focusThumb()

    await I.pressKey("Shift+ArrowRight")
    await I.seeValueText("10")

    await I.pressKey("Shift+ArrowLeft")
    await I.seeValueText("0")
  })

  test("[keyboard] should work with page up/down keys", async () => {
    await I.focusThumb()

    await I.pressKey("PageUp")
    await I.seeValueText("10")

    await I.pressKey("PageDown")
    await I.seeValueText("0")
  })

  test("[keyboard] should stay on the step grid regardless of modifier keys", async () => {
    await I.focusThumb()

    // meta/ctrl/alt + arrow should move by `step`, never a fraction of it
    await I.pressKey("Meta+ArrowRight")
    await I.seeValueText("1")

    await I.pressKey("Control+ArrowRight")
    await I.seeValueText("2")

    await I.pressKey("Alt+ArrowRight")
    await I.seeValueText("3")

    await I.pressKey("Alt+ArrowLeft")
    await I.seeValueText("2")
  })

  test("[keyboard] should respect a custom largeStep", async () => {
    await I.controls.num("largeStep", "5")
    await I.focusThumb()

    await I.pressKey("Shift+ArrowRight")
    await I.seeValueText("5")

    await I.pressKey("PageUp")
    await I.seeValueText("10")

    await I.pressKey("PageDown")
    await I.seeValueText("5")
  })

  test("[pointer] should set value on click track", async () => {
    await I.mousedownAt({ x: 0.8 })
    await I.seeThumbIsFocused()
    await I.seeValueText("80")
  })

  test("[pointer] should set the value on drag", async () => {
    await I.mousedownAt({ x: 0.8 })
    await I.seeValueText("80")
    await I.mousemoveTo({ x: 0.9 })
    await I.mouseup()
    await I.seeValueText("90")
  })

  test("[origin] 'start' (default): fills from the left edge up to the value", async () => {
    await I.mousedownAt({ x: 0.75 })
    await I.seeValueText("75")
    await I.seeFillPercent({ start: 0, end: 25 })
  })

  test("[origin] 'end': fills from the value up to the right edge", async () => {
    await I.controls.select("origin", "end")
    await I.mousedownAt({ x: 0.25 })
    await I.seeValueText("25")
    await I.seeFillPercent({ start: 25, end: 0 })
  })

  test("[origin] 'center': fills toward whichever side the value is on", async () => {
    await I.controls.select("origin", "center")

    await I.mousedownAt({ x: 0.3 })
    await I.seeValueText("30")
    await I.seeFillPercent({ start: 30, end: 50 })
    await I.mouseup()

    await I.mousedownAt({ x: 0.7 })
    await I.seeValueText("70")
    await I.seeFillPercent({ start: 50, end: 30 })
  })

  test("[origin] 'center' composes correctly with rtl", async () => {
    // dir is deliberately exercised with Home/End (not pointer/arrow clicks), since RTL
    // also reverses which physical side a click or arrow key maps to -- unrelated to origin
    await I.controls.select("origin", "center")
    await I.controls.select("dir", "rtl")
    await I.focusThumb()

    await I.pressKey("Home")
    await I.seeValueText("0")
    await I.seeFillPercent({ start: 0, end: 50 })

    await I.pressKey("End")
    await I.seeValueText("100")
    await I.seeFillPercent({ start: 50, end: 0 })
  })
})
