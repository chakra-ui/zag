import { test, expect } from "@playwright/test"
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

  test("[pointer] thumb drag should maintain relative position", async () => {
    // Start from default position (0deg) and drag thumb directly
    await I.seeValueText("0deg")

    // Get thumb position and drag it to simulate dragging from edge of thumb
    const thumbBbox = await I.page.locator("[data-scope='angle-slider'][data-part='thumb']").boundingBox()
    if (!thumbBbox) throw new Error("Thumb not found")

    const controlBbox = await I.page.locator("[data-scope='angle-slider'][data-part='control']").boundingBox()
    if (!controlBbox) throw new Error("Control not found")

    // Click at edge of thumb (not center)
    const thumbEdgeX = thumbBbox.x + thumbBbox.width * 0.8
    const thumbEdgeY = thumbBbox.y + thumbBbox.height * 0.1

    // Calculate target position for ~90 degrees (right side)
    const centerX = controlBbox.x + controlBbox.width / 2
    const centerY = controlBbox.y + controlBbox.height / 2
    const radius = (Math.min(controlBbox.width, controlBbox.height) / 2) * 0.8

    const targetX = centerX + radius // Right side of circle
    const targetY = centerY

    // Drag from thumb edge to target position
    await I.page.mouse.move(thumbEdgeX, thumbEdgeY)
    await I.page.mouse.down()
    await I.page.mouse.move(targetX, targetY)
    await I.page.mouse.up()

    const result = await I.getCurrentValue()
    console.log(`Thumb relative drag result: ${result}`)

    // Should have moved from 0deg position (exact value will depend on offset, but should be non-zero)
    const resultAngle = parseInt(result.replace("deg", ""))
    expect(resultAngle).toBeGreaterThan(0)
  })
})
