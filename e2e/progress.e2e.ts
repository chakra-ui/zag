import { expect, test } from "./_test"
import { ProgressModel } from "./models/progress.model"

let I: ProgressModel

test.describe("progress / linear", () => {
  test.beforeEach(async ({ page }) => {
    I = new ProgressModel(page)
    await I.goto("basic")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should name the bar from the label and expose the value", async () => {
    await expect(I.getBar("Upload progress")).toBeVisible()
    await expect(I.getBar()).toHaveAttribute("aria-valuemin", "0")
    await expect(I.getBar()).toHaveAttribute("aria-valuemax", "100")
    await expect(I.getBar()).not.toHaveAttribute("aria-label")
    await expect(I.getValueText()).not.toHaveAttribute("aria-live")
    await I.seeValue("0", "0%")
    await I.seeRangePercent("0")
  })

  test("should update when the value changes", async () => {
    await I.click("Increase", 2)
    await I.seeValue("40", "40%")
    await I.seeRangePercent("40")
    await I.seeState("loading")
  })

  test("should clamp to max and report complete", async () => {
    await I.click("Increase", 6)
    await I.seeValue("100", "100%")
    await I.seeState("complete")
  })

  test("should clamp to min", async () => {
    await I.click("Decrease")
    await I.seeValue("0", "0%")
  })

  test("should drop the value when indeterminate", async () => {
    await I.click("Increase")
    await I.click("Indeterminate")
    await I.seeIndeterminate()
    await I.seeState("indeterminate")
    await expect(I.getRange()).not.toHaveAttribute("style", /width/)
  })
})

test.describe("progress / custom range", () => {
  test.beforeEach(async ({ page }) => {
    I = new ProgressModel(page)
    await I.goto("custom-range")
  })

  test("should place the value within the range and format it", async () => {
    await expect(I.getBar()).toHaveAttribute("aria-valuemin", "-20")
    await expect(I.getBar()).toHaveAttribute("aria-valuemax", "40")
    await I.seeValue("10", "10°C")
    await I.seeRangePercent("50")
  })

  test("should clamp values outside the range", async () => {
    await I.click("Set -30")
    await I.seeValue("-20", "-20°C")
    await I.seeRangePercent("0")

    await I.click("Set 50")
    await I.seeValue("40", "40°C")
    await I.seeRangePercent("100")
    await I.seeState("complete")
  })

  test("should accept aria-label when there is no visible label", async () => {
    await expect(I.getBar("Syncing")).toHaveAttribute("aria-valuenow", "60")
  })
})

test.describe("progress / circular", () => {
  test.beforeEach(async ({ page }) => {
    I = new ProgressModel(page)
    await I.goto("circular")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should name the circle from the label", async () => {
    await expect(I.getBar("Syncing")).toHaveAttribute("aria-valuenow", "40")
    await expect(I.getBar("Syncing")).toHaveAttribute("aria-valuetext", "40%")
  })
})

test.describe("progress / indeterminate", () => {
  test.beforeEach(async ({ page }) => {
    I = new ProgressModel(page)
    await I.goto("indeterminate")
  })

  test("should leave out the value", async () => {
    await expect(I.getBar("Loading files")).not.toHaveAttribute("aria-valuenow")
    await expect(I.getBar("Loading files")).not.toHaveAttribute("aria-valuetext")
    await expect(I.getBar("Loading files")).toHaveAttribute("data-state", "indeterminate")
  })
})
