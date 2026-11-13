import { expect, test } from "./_test"
import { MeterModel } from "./models/meter.model"

let I: MeterModel

test.describe("meter", () => {
  test.describe("storage / low is better", () => {
    test.beforeEach(async ({ page }) => {
      I = new MeterModel(page)
      await I.goto("basic")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("should expose meter ARIA on the root", async () => {
      await expect(I.getRoot()).toHaveAttribute("role", "meter")
      await expect(I.getRoot()).toHaveAttribute("aria-valuemin", "0")
      await expect(I.getRoot()).toHaveAttribute("aria-valuemax", "100")
      await I.seeValue("70")
      await I.seeState("suboptimal")
    })

    test("should update the HTML meter region when the value changes", async () => {
      await I.setValue(10)
      await I.seeValue("10")
      await I.seeState("optimal")

      await I.setValue(70)
      await I.seeValue("70")
      await I.seeState("suboptimal")

      await I.setValue(95)
      await I.seeValue("95")
      await I.seeState("least-optimal")
    })
  })

  test.describe("battery / high is better", () => {
    test.beforeEach(async ({ page }) => {
      I = new MeterModel(page)
      await I.goto("battery")
    })

    test("should treat a high value as optimal", async () => {
      await I.setValue(90)
      await I.seeValue("90")
      await I.seeState("optimal")

      await I.setValue(50)
      await I.seeValue("50")
      await I.seeState("suboptimal")

      await I.setValue(10)
      await I.seeValue("10")
      await I.seeState("least-optimal")
    })
  })

  test.describe("custom range", () => {
    test.beforeEach(async ({ page }) => {
      I = new MeterModel(page)
      await I.goto("custom-range")
    })

    test("should place the value within the range and format it", async () => {
      await expect(I.getRoot()).toHaveAttribute("aria-valuemin", "-20")
      await expect(I.getRoot()).toHaveAttribute("aria-valuemax", "40")
      await I.seeValue("10")
      await expect(I.getRoot()).toHaveAttribute("aria-valuetext", "10°C")
      await expect(I.getValueText()).toHaveText("10°C · 50%")
      await I.seeIndicatorPercent("50")
    })

    test("should clamp values outside the range", async () => {
      await I.clickButton("Set -30")
      await I.seeValue("-20")
      await I.seeIndicatorPercent("0")
      await I.seeState("suboptimal")

      await I.clickButton("Set 18")
      await I.seeValue("18")
      await I.seeState("optimal")

      await I.clickButton("Set 50")
      await I.seeValue("40")
      await I.seeIndicatorPercent("100")
    })

    test("should accept aria-label when there is no visible label", async ({ page }) => {
      await expect(page.getByRole("meter", { name: "Disk usage" })).toHaveAttribute("aria-valuenow", "30")
    })
  })
})
