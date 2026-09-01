import { expect, test } from "@playwright/test"
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
})
