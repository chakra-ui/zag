import { expect, test } from "@playwright/test"
import { AngleSliderModel } from "./models/angle-slider.model"

let I: AngleSliderModel

test.describe("angle-slider", () => {
  test.beforeEach(async ({ page }) => {
    I = new AngleSliderModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[pointer] should jump to clicked position on control", async () => {
    // Click directly on the control (not on thumb) should jump to that position
    await I.seeValueText("0deg")

    // Click at 90 degrees position
    await I.clickControlAtAngle(90)

    const result = await I.getCurrentValue()
    const resultAngle = parseInt(result.replace("deg", ""))

    // Should be close to 90 degrees (allow some tolerance)
    expect(resultAngle).toBeGreaterThanOrEqual(85)
    expect(resultAngle).toBeLessThanOrEqual(95)
  })

  test("[pointer] should maintain relative position when dragging from thumb edge", async () => {
    // Start from default position (0deg)
    await I.seeValueText("0deg")

    // Drag thumb from its edge (not center) to 90 degrees
    await I.dragThumbFromEdgeToAngle(90)

    const result = await I.getCurrentValue()
    const resultAngle = parseInt(result.replace("deg", ""))

    // Should be close to 90 degrees despite clicking edge of thumb
    expect(resultAngle).toBeGreaterThanOrEqual(85)
    expect(resultAngle).toBeLessThanOrEqual(95)
  })

  test("[pointer] should maintain offset throughout drag operation", async () => {
    // Set initial value to 45 degrees
    await I.clickControlAtAngle(45)
    await I.seeValueText("45deg")

    // Now drag from thumb edge to 180 degrees
    await I.dragThumbFromEdgeToAngle(180)

    const result = await I.getCurrentValue()
    const resultAngle = parseInt(result.replace("deg", ""))

    // Should be close to 180 degrees
    expect(resultAngle).toBeGreaterThanOrEqual(175)
    expect(resultAngle).toBeLessThanOrEqual(185)
  })
})
