import { test } from "@playwright/test"
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
})
